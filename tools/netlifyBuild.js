import _ from 'lodash';
import Promise from 'bluebird';
import path from "path";
const landscapesInfo = require('js-yaml').safeLoad(require('fs').readFileSync('landscapes.yml'));

//execute a bash command on a given server, returns a promise.

async function main() {
  const nvmrc = require('fs').readFileSync('.nvmrc', 'utf-8').trim();
  const secrets = [
    process.env.CRUNCHBASE_KEY_4, process.env.TWITTER_KEYS, process.env.GITHUB_TOKEN, process.env.GITHUB_USER, process.env.GITHUB_KEY
  ].filter( (x) => !!x);

  const  maskSecrets = function(x) {
    let result = x;
    const replaceAll = function(s, search, replacement) {
      var target = s;
      return target.split(search).join(replacement);
    };
    for (var secret of secrets) {
      const safeString = secret.substring(0, 2) + '***' + secret.substring(secret.length -2);
      result = replaceAll(result, secret, safeString);
    }
    return result;
  }
  for (var secret of secrets) {
    console.info(maskSecrets(`We have a secret: ${secret}`));
  }

  const key = `
-----BEGIN OPENSSH PRIVATE KEY-----
${process.env.BUILDBOT_KEY.replace(/\s/g,'\n')}
-----END OPENSSH PRIVATE KEY-----
  `.split('\n').slice(1).join('\n');
  require('fs').writeFileSync('/tmp/buildbot', key);
  require('fs').chmodSync('/tmp/buildbot', 0o600);


  // now our goal is to run this on a remote server. Step 1 - xcopy the repo
  const folder = new Date().getTime();
  const remote = 'root@147.75.76.177';

  const runRemote = function(command) {
    const bashCommand = `
      nocheck=" -o StrictHostKeyChecking=no "
      ssh -i /tmp/buildbot $nocheck ${remote} << 'EOSSH'
      ${command}
EOSSH
  `
    return runLocal(bashCommand);
  };

  const runLocal = function(command) {
    return new Promise(function(resolve) {
      var spawn = require('child_process').spawn;
      var child = spawn('bash', ['-lc', command]);
      let output = [];
      child.stdout.on('data', function(data) {
        const text = maskSecrets(data.toString('utf-8'));
        // console.info(text);
        output.push(text);
        //Here is where the output goes
      });
      child.stderr.on('data', function(data) {
        const text = maskSecrets(data.toString('utf-8'));
        // console.info(text);
        output.push(text);
        //Here is where the error output goes
      });
      child.on('close', function(returnCode) {
        resolve({text: output.join(''), returnCode});
        //Here you can get the exit code of the script
      });
    });
  }
  {
    await runRemote(`mkdir -p /root/builds`);
    const result = require('child_process').spawnSync('bash', ['-lc', `
      rsync --exclude="node_modules" --exclude="dist" -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no  " . ${remote}:/root/builds/${folder}
  `], {stdio: 'inherit'});
    if (result.status !== 0) {
      console.info(`Failed to rsync, exiting`);
      process.exit(1);
    }
    console.info('Rsync done');
  }


  // lets guarantee npm install for this folder first
  //
  const branch = process.env.BRANCH;
  {
    const buildCommand = [
      "(ls . ~/.nvm/nvm.sh || curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash)",
      ". ~/.nvm/nvm.sh",
      `nvm install ${nvmrc}`,
      `nvm use ${nvmrc}`,
      `npm install -g npm --no-progress`,
      `cd /opt/repo`,
      `npm ci --no-progress --silent`
    ].join(' && ');
    const npmInstallCommand = `
      mkdir -p /root/builds/branches_cache/node_modules/${branch}
      mkdir -p /root/builds/branches_cache/nvm/${branch}
      chmod -R 777 /root/builds/branches_cache/node_modules/${branch}
      chmod -R 777 /root/builds/branches_cache/nvm/${branch}
      chmod -R 777 /root/builds/${folder}
      docker run --rm -t \
        -v /root/builds/branches_cache/node_modules/${branch}:/opt/repo/node_modules \
        -v /root/builds/branches_cache/nvm/${branch}:/opt/buildhome/.nvm \
        -v /root/builds/${folder}:/opt/repo \
        buildbot /bin/bash -lc "${buildCommand}"
    `;
    console.info(npmInstallCommand);
    console.info(`Installing npm packages`);
    const output = await runRemote(npmInstallCommand);

    console.info(`Output from npm install: exit code: ${output.returnCode}`);
    const lines = output.text.split('\n');
    const index = _.findIndex(lines, (line) => line.match(/added \d+ packages in/));
    const filteredLines = lines.slice(index !== -1 ? index : 0).join('\n');
    console.info(filteredLines);

    process.exit(1);

  }


  //


  const results = await Promise.map(landscapesInfo.landscapes, async function(landscape) {

    const vars = ['NODE_VERSION', 'RUBY_VERSION', 'CRUNCHBASE_KEY_4', 'GITHUB_KEY', 'TWITTER_KEYS'];

    const outputFolder = landscape.name + new Date().getTime();
    const r = () => _.random(30) + 10;
    const buildCommand = [
      `cd /opt/repo`,
      `export NETLIFY=1`,
      `. ~/.nvm/nvm.sh`,
      `(nvm install ${nvmrc} || (sleep ${r()} && nvm install ${nvmrc}) || (sleep ${r()} && nvm install ${nvmrc}))`,
      `nvm use`,
      `bash build.sh ${landscape.repo} ${landscape.name} master`,
      `cp -r /opt/repo/${landscape.name}/dist /dist`
    ].join('&&');
    const dockerCommand = `
      mkdir -p /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${outputFolder}
      BASE_PATH=/root/build-image
      REPO_PATH=/root/builds/${folder}
      OUTPUT_PATH=/root/builds/${outputFolder}

      docker run --rm -t \
        ${vars.map( (v) => ` -e ${v}="${process.env[v]}" `).join(' ')} \
        -e NVM_NO_PROGRESS=1 \
        -e PARALLEL=TRUE \
        -v /root/builds/branches_cache/node_modules/${branch}:/opt/repo/node_modules \
        -v /root/builds/branches_cache/nvm/${branch}:/opt/buildhome/.nvm \
        -v \${REPO_PATH}:/opt/repo \
        -v \${OUTPUT_PATH}:/dist \
        -v \${BASE_PATH}/run-build.sh:/usr/local/bin/build \
        -v \${BASE_PATH}/run-build-functions.sh:/usr/local/bin/run-build-functions.sh \
        buildbot /bin/bash -lc "${buildCommand}"
    `;

    // console.info(bashCommand);
    console.info(`processing ${landscape.name} at ${landscape.repo}`);


    // run a build command remotely for a given repo
    const output  = await runRemote(dockerCommand);
    output.landscape = lanscape;
    console.info(`Output from: ${output.landscape.name}, exit code: ${output.returnCode}`);
    const lines = output.text.split('\n');
    const index = _.findIndex(lines, (line) => line.match(/added \d+ packages in/));
    const filteredLines = lines.slice(index !== -1 ? index : 0).join('\n');
    console.info(filteredLines);
    return output;

    const rsyncResult = await runLocal(
      `
      rsync -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no " ${remote}:/root/builds/${outputFolder}/dist/ dist/${landscape.name}
      rm -rf /root/builds/${outputFolder}
      rm -rf /root/builds/${folder}
      `
    );
    console.info(`Returning files back, exit code: ${rsyncResult.returnCode}, text: \n${rsyncResult.text}`);

  });
  if (_.find(results, (x) => x.returnCode !== 0)) {
    process.exit(1);
  }
  const redirects = results.map((result) => `
    /${result.landscape.name}/ /${result.landscape.name}/prerender.html 200!
    /${result.landscape.name} /${result.landscape.name}/prerender.html 200!
    /${result.landscape.name}/* /${result.landscape.name}/index.html 200
  `).join('\n');
  const index = results.map((result) => `<div><a href="${result.landscape.name}/"><h1>${result.landscape.name}</h1></a></div>`).join('\n');
  const robots = `
    User-agent: *
    Disallow: /
  `;
  console.info({redirects});
  require('fs').writeFileSync('dist/_redirects', redirects);
  require('fs').writeFileSync('dist/index.html', index);
  require('fs').writeFileSync('dist/robots.html', robots);
  require('fs').copyFileSync(path.resolve(__dirname, '..', '_headers'), 'dist/_headers')
}
main();

