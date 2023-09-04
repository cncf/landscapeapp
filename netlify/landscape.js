// We will execute this script from a landscape build,
// "prepublish": "cp yarn.lock _yarn.lock",
// "postpublish": "rm _yarn.lock || true"
const remote = `root@${process.env.BUILD_SERVER}`;
const dockerImage = 'netlify/build:focal';
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

const runLocal = function(command, showProgress) {

  // report the output once every 5 seconds
  let lastOutput = { s: '', time: new Date().getTime() };
  let displayIfRequired = function(text) {
    if (showProgress) {
      console.info(text);
    }
    lastOutput.s = lastOutput.s + text;
  }

  return new Promise(function(resolve) {
    var spawn = require('child_process').spawn;
    var child = spawn('bash', ['-lc',`set -e \n${command}`]);
    let output = [];
    child.stdout.on('data', function(data) {
      const text = maskSecrets(data.toString('utf-8'));
      output.push(text);
      displayIfRequired(text);
      //Here is where the output goes
    });
    child.stderr.on('data', function(data) {
      const text = maskSecrets(data.toString('utf-8'));
      output.push(text);
      displayIfRequired(text);
      //Here is where the error output goes
    });
    child.on('close', function(exitCode) {
      lastOutput.done = true;
      displayIfRequired('');
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

const key = `
-----BEGIN OPENSSH PRIVATE KEY-----
${(process.env.BUILDBOT_KEY || '').replace(/\s/g,'\n')}
-----END OPENSSH PRIVATE KEY-----
  `.split('\n').slice(1).join('\n');
require('fs').writeFileSync('/tmp/buildbot', key);
require('fs').chmodSync('/tmp/buildbot', 0o600);

const runRemote = async function(command, count = 3) {
  const bashCommand = `
    nocheck=" -o StrictHostKeyChecking=no "
    ssh -i /tmp/buildbot $nocheck ${remote} << 'EOSSH'
    set -e
    ${command}
EOSSH
`
  const result = await runLocal(bashCommand, true);
  if (result.exitCode === 255 && count > 0) {
    console.info(`Attempts to retry more: ${count}`);
    return await runRemote(command, count - 1);
  }
  return result;
};

const runRemoteWithoutErrors = async function(command) {
  const result = await runRemote(command);
  console.info(result.text.trim());
  if (result.exitCode !== 0) {
    throw new Error(`Failed to execute remote ${command}, exit code: ${result.exitCode}`);
  }
}

const makeRemoteBuildWithCache = async function() {
  await runLocalWithoutErrors(`
    rm -rf packageRemote || true
    git clone -b deploy --single-branch https://github.com/cncf/landscapeapp packageRemote
  `);

  //how to get a hash based on our files
  const getHash = function() {
    const crypto = require('crypto');
    const p0 = require('fs').readFileSync('packageRemote/.nvmrc', 'utf-8').trim();
    const p1 = crypto.createHash('sha256').update(require('fs').readFileSync('packageRemote/package.json')).digest('hex');
    const p2 = crypto.createHash('sha256').update(require('fs').readFileSync('packageRemote/yarn.lock')).digest('hex');
    const p3 = crypto.createHash('sha256').update(require('fs').readFileSync('packageRemote/.yarnrc.yml')).digest('hex');
    return p0 + p1 + p2 + p3;
  }

  const getTmpFile = () => new Date().getTime().toString() + Math.random();
  const nvmrc = require('fs').readFileSync('packageRemote/.nvmrc', 'utf-8').trim();
  console.info(`node version:`, nvmrc);
  // now our goal is to run this on a remote server. Step 1 - xcopy the repo
  const folder = getTmpFile();

  await runLocalWithoutErrors(`
      rm -rf remoteDist || true
      mkdir -p remoteDist
    `);
  await runRemoteWithoutErrors(`mkdir -p /root/builds`);
  await runRemoteWithoutErrors(`docker pull ${dockerImage}`);
  await runLocalWithoutErrors(`
      rsync --exclude="package" -az -e  "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no  " . ${remote}:/root/builds/${folder}
    `);
  await runRemoteWithoutErrors(`chmod -R 777 /root/builds/${folder}`);

  const hash = getHash();
  const tmpHash = require('crypto').createHash('sha256').update(getTmpFile()).digest('hex');
  // lets guarantee npm install for this folder first
  // do not pass REVIEW_ID because on failure we will run it locally and report
  // from there
  const vars = [
    'CRUNCHBASE_KEY_4',
    'GITHUB_KEY',
    'TWITTER_KEYS',
    'GA',
    'BRANCH',
    'GITHUB_TOKEN',
    'GITHUB_USER',
    'REPOSITORY_URL'
  ];
  const outputFolder = 'landscape' + getTmpFile();
  const buildCommand = [
    `cd /opt/repo/packageRemote`,
    "(ls . ~/.nvm/nvm.sh || (curl -s -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash >/dev/null))",
    `. ~/.nvm/nvm.sh`,
    `cat .nvmrc`,
    `nvm install ${nvmrc}`,
    `nvm use ${nvmrc}`,
    `npm install -g agentkeepalive --save`,
    `npm install -g npm@9 --no-progress`,
    `npm install -g yarn@latest`,
    `yarn`,
    `git config --global --add safe.directory /opt/repo`,
    `export NODE_OPTIONS="--unhandled-rejections=strict"`,
    `PROJECT_PATH=.. yarn run build`,
    `cp -r /opt/repo/dist /dist`
  ].join(' && ');

  const dockerCommand = `
      mkdir -p /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${folder}

      docker run --shm-size 1G --rm -t \
        ${vars.map( (v) => ` -e ${v}="${process.env[v]}" `).join(' ')} \
        -e NVM_NO_PROGRESS=1 \
        -e NETLIFY=1 \
        -e PARALLEL=TRUE \
        -v /root/builds/${folder}:/opt/repo \
        -v /root/builds/${outputFolder}:/dist \
        ${dockerImage} /bin/bash -lc "${buildCommand}"

    `;

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
      rsync -az --chmod=a+r -p -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no " ${remote}:/root/builds/${outputFolder}/dist/* distRemote
    `
  ));
  await runRemote(
    `
      rm -rf /root/builds/${folder}
      rm -rf /root/builds/${outputFolder}
      `
  )

  console.info('Remote build done!');
  console.info(output.text);
  await runLocalWithoutErrors(`
      rm -rf netlify/dist || true
      rm -rf dist || true
      mkdir -p netlify/dist
      mkdir -p dist
      cp -r distRemote/* netlify/dist
      cp -r distRemote/* dist
      mv netlify/dist/functions netlify/functions
      cp -r netlify/functions functions # Fix netlify bug
    `);
  process.exit(0);
}

async function main() {
  console.info('starting', process.cwd());
  process.chdir('..');
  await runLocal('rm package*.json');

  const cleanPromise = runRemoteWithoutErrors(`
    find builds/ -maxdepth 1 -not -path "builds/node_cache" -mtime +1 -exec rm -rf {} +;
  `).catch(function() {
    console.info('Failed to clean up a builds folder');
  });

  await Promise.all([makeRemoteBuildWithCache().catch(function(ex) {
    console.info('build failed', ex);
    process.exit(1);
  }), cleanPromise]);
}

main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});

