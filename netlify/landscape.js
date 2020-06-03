// We will execute this script from a landscape build
const remote = `root@${process.env.BUILD_SERVER}`;
const dockerImage = 'netlify/build:xenial';
const dockerHome = '/opt/buildhome';

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
const debug = function() {
  if (process.env.DEBUG_BUILD) {
    console.info.apply(console, arguments);
  }
}

const runLocal = function(command, assignFn) {
  return new Promise(function(resolve) {
    var spawn = require('child_process').spawn;
    var child = spawn('bash', ['-lc',`set -e \n${command}`]);
    if (assignFn) {
      assignFn(child);
    }
    let output = [];
    child.stdout.on('data', function(data) {
      const text = maskSecrets(data.toString('utf-8'));
      output.push(text);
      //Here is where the output goes
    });
    child.stderr.on('data', function(data) {
      const text = maskSecrets(data.toString('utf-8'));
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
  debug(command);
  const result = await runLocal(command);
  console.info(result.text);
  if (result.exitCode !== 0) {
    throw new Error(`Failed to execute ${command}, exit code: ${result.exitCode}`);
  }
  return result.text.trim();
}

let buildDone = false;
let localPid;

const makeLocalBuild = async function() {
    const localOutput = await runLocal(`
      mkdir -p copy
      rsync -az --exclude="copy" . copy
      cd copy
      . ~/.nvm/nvm.sh
      npm pack interactive-landscape@latest
      tar xzf interactive*
      cd package
      nvm install \`cat .nvmrc\`
      nvm use \`cat .nvmrc\`
      npm install -g npm
      npm install
      PROJECT_PATH=.. npm run build
    `, (x) => localPid = x);

    if (!buildDone) {
      buildDone = true;
      console.info('Local build finished, exit code:', localOutput.exitCode);
      console.info(localOutput.text);
      if (localOutput.exitCode !== 0) {
        process.exit(1);
      } else {
        await runLocalWithoutErrors(`
          rm -rf netlify/dist || true
          rm -rf dist || true
          cp -r copy/dist netlify
          cp -r copy/dist .
        `);
        process.exit(0);
      }
    } else {
      console.info('Ignore local build');
    }
}

const makeRemoteBuildWithCache = async function() {
  await runLocalWithoutErrors(`
    echo extracting
    npm pack interactive-landscape@latest
    mkdir -p tmp2
    rm -rf packageRemote || true
    tar xzf interactive*.tgz -C tmp2
    mv tmp2/package packageRemote
  `);

  //how to get a hash based on our files
  const getHash = function() {
    const crypto = require('crypto');
    const p0 = require('fs').readFileSync('packageRemote/.nvmrc', 'utf-8').trim();
    const p1 = crypto.createHash('sha256').update(require('fs').readFileSync('packageRemote/package.json')).digest('hex');
    const p2 = crypto.createHash('sha256').update(require('fs').readFileSync('packageRemote/npm-shrinkwrap.json')).digest('hex');
    return p0 + p1 + p2;
  }
  const getTmpFile = () => new Date().getTime().toString() + Math.random();
  const nvmrc = require('fs').readFileSync('packageRemote/.nvmrc', 'utf-8').trim();
  console.info(`node version:`, nvmrc);

  const key = `
-----BEGIN OPENSSH PRIVATE KEY-----
${process.env.BUILDBOT_KEY.replace(/\s/g,'\n')}
-----END OPENSSH PRIVATE KEY-----
  `.split('\n').slice(1).join('\n');
  require('fs').writeFileSync('/tmp/buildbot', key);
  require('fs').chmodSync('/tmp/buildbot', 0o600);


  // now our goal is to run this on a remote server. Step 1 - xcopy the repo
  const folder = getTmpFile();

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


  const runRemoteWithoutErrors = async function(command) {
    const result = await runRemote(command);
    console.info(result.text.trim());
    if (result.exitCode !== 0) {
      throw new Error(`Failed to execute remote ${command}, exit code: ${result.exitCode}`);
    }
  }

  await runLocalWithoutErrors(`
      rm -rf remoteDist || true
      mkdir -p remoteDist
    `);
  await runRemoteWithoutErrors(`mkdir -p /root/builds`);
  await runRemoteWithoutErrors(`docker pull ${dockerImage}`);
  await runLocalWithoutErrors(`
      rsync --exclude="node_modules" -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no  " . ${remote}:/root/builds/${folder}
    `);
  await runRemoteWithoutErrors(`chmod -R 777 /root/builds/${folder}`);

  const hash = getHash();
  const tmpHash = require('crypto').createHash('sha256').update(getTmpFile()).digest('hex');
  // lets guarantee npm install for this folder first
  {
    const buildCommand = [
      "(ls . ~/.nvm/nvm.sh || curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash)",
      ". ~/.nvm/nvm.sh",
      `nvm install ${nvmrc}`,
      `nvm use ${nvmrc}`,
      `npm install -g npm --no-progress`,
      `cd /opt/repo/packageRemote`,
      `npm install --no-progress --silent`
    ].join(' && ');
    const npmInstallCommand = `
      mkdir -p /root/builds/node_cache
      ls -l /root/builds/node_cache/${hash}/node_modules/react 2>/dev/null || (
          mkdir -p /root/builds/node_cache/${tmpHash}/{npm,nvm,node_modules}
          chmod -R 777 /root/builds/node_cache/${tmpHash}
          docker run --rm -t \
            -v /root/builds/node_cache/${tmpHash}/node_modules:/opt/repo/packageRemote/node_modules \
            -v /root/builds/node_cache/${tmpHash}/nvm:${dockerHome}/.nvm \
            -v /root/builds/node_cache/${tmpHash}/npm:${dockerHome}/.npm \
            -v /root/builds/${folder}:/opt/repo \
            ${dockerImage} /bin/bash -lc "${buildCommand}"

          ln -s /root/builds/node_cache/${tmpHash} /root/builds/node_cache/${hash} || (
            rm -rf /root/builds/node_cache/${tmpHash}
          )
          echo "node_modules for ${hash} had been installed"
      )
      chmod -R 777 /root/builds/node_cache/${hash}
    `;
    debug(npmInstallCommand);
    console.info(`Remote with cache: Installing npm packages if required`);
    const output = await runRemote(npmInstallCommand);
    console.info(`Remote with cache: Output from npm install: exit code: ${output.exitCode}`);
    if (output.exitCode !== 0) {
      console.info(output.text);
      throw new Error('Remote with cahce: npm install failed');
    }

    const lines = output.text.split('\n');
    const index = lines.indexOf(lines.filter( (line) => line.match(/added \d+ packages in/))[0]);
    const filteredLines = lines.slice(index !== -1 ? index : 0).join('\n');
    console.info(filteredLines || 'Reusing an existing folder for node');

  }

  const vars = ['CRUNCHBASE_KEY_4', 'GITHUB_KEY', 'TWITTER_KEYS'];
  const outputFolder = 'landscape' + getTmpFile();
  const buildCommand = [
    `cd /opt/repo/packageRemote`,
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
        -v /root/builds/node_cache/${hash}/node_modules:/opt/repo/packageRemote/node_modules \
        -v /root/builds/node_cache/${hash}/nvm:${dockerHome}/.nvm \
        -v /root/builds/node_cache/${hash}/npm:${dockerHome}/.npm \
        -v /root/builds/${folder}:/opt/repo \
        -v /root/builds/${outputFolder}:/dist \
        ${dockerImage} /bin/bash -lc "${buildCommand}"

    `;

  // const buildCommandWithNpmInstall = [
    // `cd /opt/repo/package`,
    // `. ~/.nvm/nvm.sh`,
    // `nvm use`,
    // `npm install -g npm --no-progress --silent`,
    // `npm install --no-progress --silent`,
    // `PROJECT_PATH=.. npm run build`,
    // `cp -r /opt/repo/dist /dist`
  // ].join(' && ');

  // const dockerCommandWithNpmInstall = `
      // mkdir -p /root/builds/${outputFolder}
      // chmod -R 777 /root/builds/${outputFolder}
      // chmod -R 777 /root/builds/${folder}
      // chmod -R 777 /root/builds/node_cache/${hash}

      // docker run --rm -t \
        // ${vars.map( (v) => ` -e ${v}="${process.env[v]}" `).join(' ')} \
        // -e NVM_NO_PROGRESS=1 \
        // -e NETLIFY=1 \
        // -e PARALLEL=TRUE \
        // -v /root/builds/node_cache/${hash}/nvm:${dockerHome}/.nvm \
        // -v /root/builds/node_cache/${hash}/npm:${dockerHome}/.npm \
        // -v /root/builds/${folder}:/opt/repo \
        // -v /root/builds/${outputFolder}:/dist \
        // ${dockerImage} /bin/bash -lc "${buildCommandWithNpmInstall}"

    // `;

  debug(dockerCommand);

  // run a build command remotely for a given repo
  let output;
  output  = await runRemote(dockerCommand);
  console.info(`Output from remote build, exit code: ${output.exitCode}`);
  if (output.exitCode === 255) { // a single ssh failure
    console.info('SSH failure! Retrying ...');
    output  = await runRemote(dockerCommand);
    console.info(`Output from remote build, exit code: ${output.exitCode}`);
  } else if (output.exitCode !== 0) {
    console.info(output.text);
    throw new Error('Remote build failed');
    // console.info('Retrying with reinstalling npm');
    // output  = await runRemote(dockerCommandWithNpmInstall);
    // console.info(`Output from remote build, exit code: ${output.exitCode}`);
  }
  console.info(output.text);
  // a build is done
  console.info(await runLocalWithoutErrors(
    `
      mkdir -p distRemote
      rsync -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no " ${remote}:/root/builds/${outputFolder}/dist/* distRemote
    `
  ));
  await runRemoteWithoutErrors(
    `
      rm -rf /root/builds/${folder}
      rm -rf /root/builds/${outputFolder}
      `
  )
  if (!buildDone) {
    buildDone = true;
    localPid.kill('SIGKILL');
    console.info('Remote build done!');
    console.info(output.text);
    await runLocalWithoutErrors(`
      rm -rf netlify/dist || true
      rm -rf dist || true
      mkdir -p netlify/dist
      mkdir -p dist
      cp -r distRemote/* netlify/dist
      cp -r distRemote/* dist
      ls -la netlify/dist
      ls -la dist
    `);
    process.exit(0);
  }
}

async function main() {
  const LANDSCAPEAPP = process.env.LANDSCAPEAPP || "latest"
  const path = require('path');
  console.info('starting', process.cwd());
  process.chdir('..');

  await Promise.all([makeRemoteBuildWithCache().catch(function(ex) {
    console.info('Remote build failed! Continuing with a local build', ex);
  }), makeLocalBuild()]);

}

main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});

