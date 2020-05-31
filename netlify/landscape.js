// We will execute this script from a landscape build
const LANDSCAPEAPP = process.env.LANDSCAPEAPP || "latest"
const path = require('path');
const run = function(x) {
  console.info(require('child_process').execSync(x).toString())
}
const debug = function() {
  if (process.env.DEBUG_BUILD) {
    console.info.apply(console, arguments);
  }
}
console.info('starting', process.cwd());
run(` rm -rf ../node_modules/* || true `);
run('rm -rf /opt/buildhome/cache/node_modules/* || true');
process.chdir('..');

console.info('starting real script', process.cwd());

const dockerImage = 'netlify/build:xenial';
const dockerHome = '/opt/buildhome';

run(`npm pack interactive-landscape@${LANDSCAPEAPP} && tar xzf interactive*.tgz`);

//how to get a hash based on our files
const sha256Command = function() {
  const crypto = require('crypto');
  const p0 = require('fs').readFileSync('package/.nvmrc', 'utf-8').trim();
  const p1 = crypto.createHash('sha256').update(require('fs').readFileSync('package/package.json')).digest('hex');
  const p2 = crypto.createHash('sha256').update(require('fs').readFileSync('package/npm-shrinkwrap.json')).digest('hex');
  return p0 + p1 + p2;
}
const getTmpFile = () => new Date().getTime().toString() + Math.random();


async function main() {
  const nvmrc = require('fs').readFileSync('package/.nvmrc', 'utf-8').trim();
  console.info(nvmrc);
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
  const folder = getTmpFile();
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
        console.info(text);
        output.push(text);
        //Here is where the output goes
      });
      child.stderr.on('data', function(data) {
        const text = maskSecrets(data.toString('utf-8'));
        console.info(text);
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
    if (result.exitCode !== 0) {
      throw new Error(`Failed to execute ${command}, exit code: ${result.exitCode}`);
    }
    return result.text.trim();
  }

  const runRemoteWithoutErrors = async function(command) {
    const result = await runRemote(command);
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
  await runRemoteWithoutErrors(`chmod -R 777 /root/builds/${folder}`);

  const hash = sha256Command();
  const tmpHash = require('crypto').createHash('sha256').update(getTmpFile()).digest('hex');
  // lets guarantee npm install for this folder first
  {
    const buildCommand = [
      "(ls . ~/.nvm/nvm.sh || curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash)",
      ". ~/.nvm/nvm.sh",
      `nvm install ${nvmrc}`,
      `nvm use ${nvmrc}`,
      `npm install -g npm --no-progress`,
      `cd /opt/repo/package`,
      `npm install --no-progress --silent`
    ].join(' && ');
    const npmInstallCommand = `
      mkdir -p /root/builds/node_cache
      ls -l /root/builds/node_cache/${hash} 2>/dev/null || (
          echo ${hash} folder not found, running npm install
          cp -r /root/builds/node_cache/master/${nvmrc} /root/builds/node_cache/${tmpHash}} 2>/dev/null || (
            echo "node_cache from master branch not found, initializing an empty repo"
            mkdir -p /root/builds/node_cache/${tmpHash}/{npm,nvm,node_modules}
          )

          chmod -R 777 /root/builds/node_cache/${tmpHash}
          docker run --rm -t \
            -v /root/builds/node_cache/${tmpHash}/node_modules:/opt/repo/package/node_modules \
            -v /root/builds/node_cache/${tmpHash}/nvm:${dockerHome}/.nvm \
            -v /root/builds/node_cache/${tmpHash}/npm:${dockerHome}/.npm \
            -v /root/builds/${folder}:/opt/repo \
            ${dockerImage} /bin/bash -lc "${buildCommand}"
          mv -T /root/builds/node_cache/${tmpHash}/ /root/builds/node_cache/${hash}/ || true
          echo "node_modules for ${hash} had been installed"
      )
    `;
    debug(npmInstallCommand);
    console.info(`Installing npm packages if required`);
    const output = await runRemote(npmInstallCommand);
    console.info(`Output from npm install: exit code: ${output.exitCode}`);
    const lines = output.text.split('\n');
    const index = lines.indexOf(lines.filter( (line) => line.match(/added \d+ packages in/))[0]);
    const filteredLines = lines.slice(index !== -1 ? index : 0).join('\n');
    console.info(filteredLines);

  }

  const vars = ['CRUNCHBASE_KEY_4', 'GITHUB_KEY', 'TWITTER_KEYS'];
  const outputFolder = 'landscape' + getTmpFile();
  const buildCommand = [
    `cd /opt/repo/package`,
    `. ~/.nvm/nvm.sh`,
    `nvm install ${nvmrc}`,
    `nvm use ${nvmrc}`,
    `PROJECT_PATH=.. npm run build`,
    `cp -r /opt/repo/dist /dist`
  ].join(' && ');

  const dockerCommand = `
      mkdir -p /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${folder}
      chmod -R 777 /root/builds/node_cache/${hash}

      docker run --rm -t \
        ${vars.map( (v) => ` -e ${v}="${process.env[v]}" `).join(' ')} \
        -e NVM_NO_PROGRESS=1 \
        -e NETLIFY=1 \
        -e PARALLEL=TRUE \
        -v /root/builds/node_cache/${hash}/node_modules:/opt/repo/package/node_modules \
        -v /root/builds/node_cache/${hash}/nvm:${dockerHome}/.nvm \
        -v /root/builds/node_cache/${hash}/npm:${dockerHome}/.npm \
        -v /root/builds/${folder}:/opt/repo \
        -v /root/builds/${outputFolder}:/dist \
        ${dockerImage} /bin/bash -lc "${buildCommand}"

    `;

  const buildCommandWithNpmInstall = [
    `cd /opt/repo/package`,
    `. ~/.nvm/nvm.sh`,
    `nvm use`,
    `npm install -g npm --no-progress --silent`,
    `npm install --no-progress --silent`,
    `PROJECT_PATH=.. npm run build`,
    `cp -r /opt/repo/dist /dist`
  ].join(' && ');

  const dockerCommandWithNpmInstall = `
      mkdir -p /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${folder}
      chmod -R 777 /root/builds/node_cache/${hash}

      docker run --rm -t \
        ${vars.map( (v) => ` -e ${v}="${process.env[v]}" `).join(' ')} \
        -e NVM_NO_PROGRESS=1 \
        -e NETLIFY=1 \
        -e PARALLEL=TRUE \
        -v /root/builds/node_cache/${hash}/nvm:${dockerHome}/.nvm \
        -v /root/builds/node_cache/${hash}/npm:${dockerHome}/.npm \
        -v /root/builds/${folder}:/opt/repo \
        -v /root/builds/${outputFolder}:/dist \
        ${dockerImage} /bin/bash -lc "${buildCommandWithNpmInstall}"

    `;

  console.info(`processed a remote build`);
  debug(dockerCommand);

  // run a build command remotely for a given repo
  let output;
  output  = await runRemote(dockerCommand);
  console.info(`Output from remote build, exit code: ${output.exitCode}`);
  if (output.exitCode === 255) { // a single ssh failure
    console.info('Retrying ...');
    output  = await runRemote(dockerCommand);
    console.info(`Output from remote build, exit code: ${output.exitCode}`);
  } else if (output.exitCode !== 0) {
    // console.info('Retrying with reinstalling npm');
    // output  = await runRemote(dockerCommandWithNpmInstall);
    // console.info(`Output from remote build, exit code: ${output.exitCode}`);
  }

  // check if the reason was a lack of npm install actually

  await runLocalWithoutErrors(
    `
      rm -rf dist 2>/dev/null || true;
      rsync -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no " ${remote}:/root/builds/${outputFolder}/dist dist
    `
  );

  await runRemoteWithoutErrors(
    `
      rm -rf /root/builds/${folder}
      rm -rf /root/builds/${outputFolder}
      `
  )

  if (output.exitCode !== 0) {
    console.info(`Bad exit code from the remote build. Exiting the build`);
    process.exit(1);
  }
}

main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});

