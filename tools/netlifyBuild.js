import _ from 'lodash';
import Promise from 'bluebird';
import path from "path";
const landscapesInfo = require('js-yaml').safeLoad(require('fs').readFileSync('landscapes.yml'));

const dockerImage = 'netlify/build:xenial';
const dockerHome = '/opt/buildhome';

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

  const runRemote = async function(command) {
    const bashCommand = `
      nocheck=" -o StrictHostKeyChecking=no "
      ssh -i /tmp/buildbot $nocheck ${remote} << 'EOSSH'
      ${command}
EOSSH
  `
    return await runLocal(bashCommand);
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
    await runRemote(`docker pull ${dockerImage}`);
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
      `npm install --no-progress --silent`
    ].join(' && ');
    const npmInstallCommand = `
      mkdir -p /root/builds/branches_cache/${branch}/npm
      mkdir -p /root/builds/branches_cache/${branch}/nvm
      mkdir -p /root/builds/branches_cache/${branch}/node_modules
      chmod -R 777 /root/builds/branches_cache/${branch}/npm
      chmod -R 777 /root/builds/branches_cache/${branch}/nvm
      chmod -R 777 /root/builds/branches_cache/${branch}/node_modules
      chmod -R 777 /root/builds/${folder}
      docker run --rm -t \
        -v /root/builds/branches_cache/${branch}/node_modules:/opt/repo/node_modules \
        -v /root/builds/branches_cache/${branch}/nvm:${dockerHome}/.nvm \
        -v /root/builds/branches_cache/${branch}/npm:${dockerHome}/.npm \
        -v /root/builds/${folder}:/opt/repo \
        ${dockerImage} /bin/bash -lc "${buildCommand}"
    `;
    console.info(npmInstallCommand);
    console.info(`Installing npm packages`);
    const output = await runRemote(npmInstallCommand);

    console.info(`Output from npm install: exit code: ${output.returnCode}`);
    const lines = output.text.split('\n');
    const index = _.findIndex(lines, (line) => line.match(/added \d+ packages in/));
    const filteredLines = lines.slice(index !== -1 ? index : 0).join('\n');
    console.info(filteredLines);

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
      `nvm use`,
      `bash build.sh ${landscape.repo} ${landscape.name} master`,
      `cp -r /opt/repo/${landscape.name}/dist /dist`
    ].join(' && ');
    const dockerCommand = `
      mkdir -p /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${outputFolder}
      REPO_PATH=/root/builds/${folder}
      OUTPUT_PATH=/root/builds/${outputFolder}

      docker run --rm -t \
        ${vars.map( (v) => ` -e ${v}="${process.env[v]}" `).join(' ')} \
        -e NVM_NO_PROGRESS=1 \
        -e PARALLEL=TRUE \
        -v /root/builds/branches_cache/${branch}/node_modules:/opt/repo/node_modules \
        -v /root/builds/branches_cache/${branch}/nvm:${dockerHome}/.nvm \
        -v /root/builds/branches_cache/${branch}/npm:${dockerHome}/.npm \
        -v /root/builds/${folder}:/opt/repo \
        -v /root/builds/${outputFolder}:/dist \
        ${dockerImage} /bin/bash -lc "${buildCommand}"
    `;

    // console.info(dockerCommand);
    console.info(`processing ${landscape.name} at ${landscape.repo}`);


    // run a build command remotely for a given repo
    let output;

    output  = await runRemote(dockerCommand);
    output.landscape = landscape;
    console.info(`Output from: ${output.landscape.name}, exit code: ${output.returnCode}`);
    console.info(output.text);
    if (output.returnCode === 255) { // a single ssh failure
      output  = await runRemote(dockerCommand);
      output.landscape = landscape;
      console.info('Retrying ...');
      console.info(`Output from: ${output.landscape.name}, exit code: ${output.returnCode}`);
      console.info(output.text);
    }

    const rsyncResult = await runLocal(
      `
      rsync -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no " ${remote}:/root/builds/${outputFolder}/dist/ dist/${landscape.name}
      `
    );
    await runRemote(
      `
      rm -rf /root/builds/${outputFolder}
      `
    )
    console.info(`Returning files back, exit code: ${rsyncResult.returnCode}, text: \n${rsyncResult.text}`);
    return output;

  });
  await runRemote(`rm -rf /root/builds/${folder}`);
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
  require('fs').writeFileSync('dist/_redirects', redirects);
  require('fs').writeFileSync('dist/index.html', index);
  require('fs').writeFileSync('dist/robots.html', robots);
  require('fs').copyFileSync(path.resolve(__dirname, '..', '_headers'), 'dist/_headers')
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});

