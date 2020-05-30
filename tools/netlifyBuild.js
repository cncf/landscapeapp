import _ from 'lodash';
import Promise from 'bluebird';
import path from "path";
const landscapesInfo = require('js-yaml').safeLoad(require('fs').readFileSync('landscapes.yml'));

const dockerImage = 'netlify/build:xenial';
const dockerHome = '/opt/buildhome';

//how to get a hash based on our files
const sha256Command = `node -e "
  const p0 = require('fs').readFileSync('.nvmrc', 'utf-8');
  const p1 = (crypto.createHash('sha256').update(require('fs').readFileSync('npm-shrinkwrap.json')).digest('hex'));"
  const p2 = (crypto.createHash('sha256').update(require('fs').readFileSync('npm-shrinkwrap.json')).digest('hex'));"
  console.info(p0 + p1 + p2);
`;


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
      set -e
      ${command}
EOSSH
  `
    return await runLocal(bashCommand);
  };

  const runLocal = function(command) {
    return new Promise(function(resolve) {
      var spawn = require('child_process').spawn;
      var child = spawn('bash', ['-lc',`set -e \n${command}`]);
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
      child.on('close', function(exitCode) {
        resolve({text: output.join(''), exitCode});
        //Here you can get the exit code of the script
      });
    });
  }

  const runLocalWithoutErrors = async function(command) {
    const result = await runLocal(command);
    console.info(result.text);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to execute ${command}, exit code: ${result.exitCode}`);
    }
    return result.text.trim();
  }

  const runRemoteWithoutErrors = async function(command) {
    const result = await runRemote(command);
    console.info(result.text);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to execute remote ${command}, exit code: ${result.exitCode}`);
    }
    return result.text.trim();
  }

  await runLocalWithoutErrors(`
      rm -rf dist || true
      mkdir -p dist
    `);
  await runRemoteWithoutErrors(`mkdir -p /root/builds`);
  await runRemoteWithoutErrors(`docker pull ${dockerImage}`);
  await runLocalWithoutErrors(`
      rsync --exclude="node_modules" --exclude="dist" -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no  " . ${remote}:/root/builds/${folder}
    `);
  console.info('Rsync done');

  const hash = await runLocalWithoutErrors(sha256Command);
  const tmpHash = crypto.createHash('sha256').update(Math.random() + new Date().getTime()).digest('hex');
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
      mkdir -p /root/builds/node_cache
      ls -l /root/builds/node_cache/${hash} || (
          echo ${hash} folder not found, running npm install
          cp -r root/builds/node_cache/{master,${tmpHash}} || (
            mkdir -p root/builds/node_cache/${tmpHash}/{npm,nvm,node_modules}
            chmod -R 777 root/builds/node_cache/${tmpHash}/{npm,nvm,node_modules}
          )

          docker run --rm -t \
            -v /root/builds/node_cache/${tmpHash}/node_modules:/opt/repo/node_modules \
            -v /root/builds/node_cache/${tmpHash}/nvm:${dockerHome}/.nvm \
            -v /root/builds/node_cache/${tmpHash}/npm:${dockerHome}/.npm \
            -v /root/builds/${folder}:/opt/repo \
            ${dockerImage} /bin/bash -lc "${buildCommand}"
            mv -T /root/builds/node_cache/${tmpHash}/ /root/builds/node_cache/${hash}/ || true
          echo "node_modules for ${hash} had been installed"
      )
    `;
    console.info(npmInstallCommand);
    console.info(`Installing npm packages`);
    const output = await runRemote(npmInstallCommand);
    console.info(`Output from npm install: exit code: ${output.exitCode}`);
    const lines = output.text.split('\n');
    const index = _.findIndex(lines, (line) => line.match(/added \d+ packages in/));
    const filteredLines = lines.slice(index !== -1 ? index : 0).join('\n');
    console.info(filteredLines);

  }
  // all landscapes
  const results = await Promise.map(landscapesInfo.landscapes, async function(landscape) {
    const vars = ['CRUNCHBASE_KEY_4', 'GITHUB_KEY', 'TWITTER_KEYS'];
    const outputFolder = landscape.name + new Date().getTime();
    const buildCommand = [
      `cd /opt/repo`,
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
        -e NETLIFY=1 \
        -e PARALLEL=TRUE \
        -v /root/builds/node_cache/${hash}/node_modules:/opt/repo/node_modules \
        -v /root/builds/node_cache/${hash}/nvm:${dockerHome}/.nvm \
        -v /root/builds/node_cache/${hash}/npm:${dockerHome}/.npm \
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
    console.info(`Output from: ${output.landscape.name}, exit code: ${output.exitCode}`);
    console.info(output.text);
    if (output.exitCode === 255) { // a single ssh failure
      output  = await runRemote(dockerCommand);
      output.landscape = landscape;
      console.info('Retrying ...');
      console.info(`Output from: ${output.landscape.name}, exit code: ${output.exitCode}`);
      console.info(output.text);
    }

    await runLocal(
      `
      rsync -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no " ${remote}:/root/builds/${outputFolder}/dist/ dist/${landscape.name}
      `
    );
    await runRemote(
      `
      rm -rf /root/builds/${outputFolder}
      `
    )
    return output;
  });
  await runRemote(`rm -rf /root/builds/${folder}`);
  if (_.find(results, (x) => x.exitCode !== 0)) {
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

  require('fs').writeFileSync("User-agent: *", "dist/robots.txt");
  // comment below when about to test a googlebot rendering
  require('fs').appendFileSync("Disallow: /", "dist/robots.txt");

  if (process.env.BRANCH === 'master') {
    runLocalWithoutErrors(`
      git config --global user.email "info@cncf.io"
      git config --global user.name "CNCF-bot"
      git remote rm github 2>/dev/null || true
      git remote add github "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/cncf/landscapeapp"
      git fetch github
      # git diff # Need to comment this when a diff is too large
      git checkout -- .
      npm version patch
      git commit -m 'Update to a new version [skip ci]' --allow-empty --amend
      git branch -D tmp || true
      git checkout -b tmp
      git push github HEAD:master
      git push github HEAD:master --tags --force
      echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
      git diff
      npm -q publish || (sleep 5 && npm -q publish) || (sleep 30 && npm -q publish)
      echo 'Npm package published'
    `);
    //now we have a different cache, because we updated a version, but for build purposes thes are same npm modules
    const newHash = await runLocalWithoutErrors(sha256Command);
    await runRemoteWithoutErrors(`
      cp -r /root/builds/node_cache/${hash} /root/builds/node_cache/${newHash}
      cp -r /root/builds/node_cache/${hash} /root/builds/node_cache/master
      chmod -r 777 /root/builds/node_cache/${newHash}
      chmod -r 777 /root/builds/node_cache/master
    `);
    for (var landscape of landscapesInfo.landscapes) {
      console.info(`triggering a hook  for ${landscape.name}`);
      await runLocalWithoutErrors(`curl -X POST -d {} https://api.netlify.com/build_hooks/${landscape.hook}`);
    }
  }
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});

