const path = require('path')
const { readdirSync, writeFileSync } = require('fs')
const generateIndex = require('./generateIndex')
const run = function(x) {
  console.info(require('child_process').execSync(x).toString())
}
const debug = function() {
  if (process.env.DEBUG_BUILD) {
    console.info.apply(console, arguments);
  }
}

const pause = function(i) {
  return new Promise(function(resolve) {
    setTimeout(resolve, i * 1000);
  })
};

const yaml = require('./jsyaml');
process.chdir('..');
const landscapesInfo = yaml.load(require('fs').readFileSync('landscapes.yml'));

const dockerImage = 'netlify/build:focal';
const dockerHome = '/opt/buildhome';

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
    const result = await runLocal(bashCommand);
    let newOutput = [];
    for (var l of result.text.split('\n')) {
      if (l.match(/Counting objects: /)) {
        continue;
      }
      if (l.match(/ExperimentalWarning: Custom ESM Loaders is an experimental feature./)) {
        continue
      }
      if (l.match(/Compressing objects: /)) {
        continue;
      }
      if (l.match(/Receiving objects: /)) {
        continue;
      }
      if (l.match(/Resolving deltas: /)) {
        continue;
      }
      if (l.match(/Could not resolve ".*?" in file/)) {
        continue;
      }
      newOutput.push(l);
      if (l.includes('mesg: ttyname failed: Inappropriate ioctl for device')) {
        newOutput = [];
      }
    }
    result.text = newOutput.join('\n');
    return result;
  };

  const runLocal = function(command) {
    return new Promise(function(resolve) {
      let finished = false;
      let timeout = setTimeout(function() {
        if (finished) {
          return;
        }
        finished = true;
        child.kill();
        resolve({
          exitCode: 'timeout',
          text: 'A command took more than 25 minutes. \n' + output.join('')
        });
      }, 25 * 60 * 1000);
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
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          resolve({text: output.join(''), exitCode});
        }
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
      mkdir -p dist netlify/functions
    `);
  await runRemoteWithoutErrors(`mkdir -p /root/builds`);
  await runRemoteWithoutErrors(`docker pull ${dockerImage}`);
  await runLocalWithoutErrors(`
      rsync --exclude="node_modules" --exclude="dist" -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no  " . ${remote}:/root/builds/${folder}
    `);
  console.info('Rsync done');
  await runRemoteWithoutErrors(`chmod -R 777 /root/builds/${folder}`);

  // lets guarantee npm install for this folder first
  const branch = process.env.BRANCH;
  {
    const buildCommand = [
      "(ls . ~/.nvm/nvm.sh || (curl -s -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash >/dev/null))",
      ". ~/.nvm/nvm.sh",
      `nvm install ${nvmrc} >/dev/null`,
      `nvm use ${nvmrc}`,
      `npm install -g yarn --no-progress --silent`,
      `cd /opt/repo`,
      `yarn >/dev/null`
    ].join(' && ');
    const npmInstallCommand = `
      mkdir -p /root/builds/${folder}_node
      mkdir -p /root/builds/${folder}_node/{yarnGlobal,nvm}
      chmod -R 777 /root/builds/${folder}_node
      docker run --shm-size 1G --rm -t \
        -v /root/builds/${folder}_node/nvm:${dockerHome}/.nvm \
        -v /root/builds/${folder}_node/yarnGlobal:${dockerHome}/.yarn \
        -v /root/builds/${folder}:/opt/repo \
        ${dockerImage} /bin/bash -lc "${buildCommand}"
      chmod -R 777 /root/builds/${folder}_node
    `
    debug(npmInstallCommand);
    console.info(`Installing npm packages`);
    const output = await runRemote(npmInstallCommand);
    console.info(`Output from npm install: exit code: ${output.exitCode}`);
    const lines = output.text.split('\n');
    const index = lines.indexOf(lines.filter( (line) => line.match(/added \d+ packages in/))[0]);
    const filteredLines = lines.slice(index !== -1 ? index : 0).join('\n');
    console.info(filteredLines);

  }
  // all landscapes

  const results = await Promise.all(landscapesInfo.landscapes.map(async function(landscape, i) {
    await pause(i);
    const vars = ['CRUNCHBASE_KEY_4', 'GITHUB_KEY', 'TWITTER_KEYS'];
    const outputFolder = landscape.name + new Date().getTime();
    const buildCommand = [
      `cd /opt/repo`,
      `. ~/.nvm/nvm.sh`,
      `nvm use`,
      `export NODE_OPTIONS="--unhandled-rejections=strict"`,
      `bash build.sh ${landscape.repo} ${landscape.name}`,
      `cp -r /opt/repo/${landscape.name}/dist /dist`
    ].join(' && ');
    const nodeModulesFolder = `${folder}_node`;
    const dockerCommand = `
      mkdir -p /root/builds/${outputFolder}
      chmod -R 777 /root/builds/${outputFolder}
      mkdir -p /tmp/${outputFolder}/public  /tmp/${outputFolder}/out  /tmp/${outputFolder}/.next
      chmod -R 777 /tmp/${outputFolder}

      REPO_PATH=/root/builds/${folder}
      OUTPUT_PATH=/root/builds/${outputFolder}

      docker run --shm-size 1G --rm -t \
        ${vars.map( (v) => ` -e ${v}="${process.env[v]}" `).join(' ')} \
        -e NVM_NO_PROGRESS=1 \
        -e NETLIFY=1 \
        -e PARALLEL=TRUE \
        -v /root/builds/${nodeModulesFolder}/nvm:${dockerHome}/.nvm \
        -v /root/builds/${nodeModulesFolder}/yarnGlobal:${dockerHome}/.yarn \
        -v /tmp/${outputFolder}/public:/opt/repo/public \
        -v /tmp/${outputFolder}/out:/opt/repo/out \
        -v /tmp/${outputFolder}/.next:/opt/repo/.next \
        -v /root/builds/${folder}:/opt/repo \
        -v /root/builds/${outputFolder}:/dist \
        ${dockerImage} /bin/bash -lc "${buildCommand}"
    `;

    console.info(`processing ${landscape.name} at ${landscape.repo}`);
    debug(dockerCommand);


    // run a build command remotely for a given repo
    let output;

    output  = await runRemote(dockerCommand);
    output.landscape = landscape;
    if (output.exitCode) {
      console.info(`Output from: ${output.landscape.name}, exit code: ${output.exitCode}`);
      console.info(output.text);
    } else {
      console.info(`Done: ${output.landscape.name}`);
    }
    if (output.exitCode === 255) { // a single ssh failure
      output  = await runRemote(dockerCommand);
      output.landscape = landscape;
      console.info('Retrying ...');
      console.info(`Output from: ${output.landscape.name}, exit code: ${output.exitCode}`);
      console.info(output.text);
    }
    landscape.done = true;
    console.info(`Remaining : ${landscapesInfo.landscapes.filter( (x) => !x.done).map( (x) => x.name).join(',')}`);

    await runLocal(
      `
      rsync -az --chmod=a+r -p -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no " ${remote}:/root/builds/${outputFolder}/dist/${landscape.name}/ dist/${landscape.name}
      `
    );

    await runLocal(`mv dist/${landscape.name}/functions/* netlify/functions`)

    await runRemote(
      `
      rm -rf /root/builds/${outputFolder}
      `
    )
    return output;
  }));
  await runRemote(`
    rm -rf /root/builds/${folder}
    rm -rf /root/builds/${folder}_node || true
  `);
  for (let x of results) {
    if (x.exitCode !== 0 && x.landscape.required) {
      console.info(`a landscape ${x.landscape.name} failed but it is required = ${x.landscape.required}`);
      process.exit(1);
    }
  }

  const index = generateIndex(results)
  const robots = `
    User-agent: *
    Disallow: /
  `;
  require('fs').writeFileSync('dist/index.html', index);
  require('fs').writeFileSync('dist/robots.html', robots);
  require('fs').copyFileSync(path.resolve(__dirname, '..', '_headers'), 'dist/_headers')

  const notFoundRedirects = landscapesInfo.landscapes.map(({ name }) => `/${name}/* /${name}/404.html 404`)
  const functionRedirects = readdirSync('netlify/functions').map(file => {
    const prefixedName = file.replace(/\..*/, '')
    const [landscape, functionName] = prefixedName.split('--')
    const newPath = `/${landscape}/api/${functionName}`
    return `${newPath} /.netlify/functions/${prefixedName} 200`
  })
  writeFileSync('dist/_redirects', [...functionRedirects, ...notFoundRedirects].join('\n'))

  require('fs').writeFileSync("dist/robots.txt", "User-agent: *");
  // comment below when about to test a googlebot rendering
  require('fs').appendFileSync("dist/robots.txt", "Disallow: /");

  await runLocalWithoutErrors('cp -r dist netlify');

  if (process.env.BRANCH === 'master') {
    await runLocalWithoutErrors(`
      git config --global user.email "info@cncf.io"
      git config --global user.name "CNCF-bot"
      git remote rm github 2>/dev/null || true
      git remote add github "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/cncf/landscapeapp"
      git fetch github
      # git diff # Need to comment this when a diff is too large
      git checkout -- .
      npm version patch || npm version patch || npm version patch
      git commit -m 'Update to a new version [skip ci]' --allow-empty --amend
      git branch -D tmp || true
      git checkout -b tmp
      git push github HEAD:master || true
      git push github HEAD:master --tags --force
      echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
      git diff
      npm -q publish || (sleep 5 && npm -q publish) || (sleep 30 && npm -q publish)
      echo 'Npm package published'
    `);
    // just for debug purpose
    //now we have a different hash, because we updated a version, but for build purposes we have exactly same npm modules
    for (let landscape of landscapesInfo.landscapes) {
      console.info(`triggering a hook  for ${landscape.name}`);
      await runLocalWithoutErrors(`curl -X POST -d {} https://api.netlify.com/build_hooks/${landscape.hook}`);
    }
  }
}
main().then(function() {
  process.exit(0);
}).catch(function(ex) {
  console.info(ex);
  process.exit(1);
});

