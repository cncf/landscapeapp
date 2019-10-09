import _ from 'lodash';
import Promise from 'bluebird';
const landscapesInfo = require('js-yaml').safeLoad(require('fs').readFileSync('landscapes.yml'));

async function main() {
  const secrets = [
    process.env.CRUNCHBASE_KEY, process.env.TWITTER_KEYS, process.env.GITHUB_TOKEN, process.env.GITHUB_USER, process.env.GITHUB_KEY
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
  const result = require('child_process').spawnSync('bash', ['-lc', `
      rsync --exclude="node_modules" -az -e "ssh -i /tmp/buildbot " . ${remote}:/root/${folder}
  `], {stdio: 'inherit'});
  if (result.status !== 0) {
    console.info(`Failed to rsync, exiting`);
    process.exit(1);
  }
  console.info('Rsync done');

  const results = await Promise.map(landscapesInfo.landscapes, async function(landscape) {

    const vars = ['NODE_VERSION', 'RUBY_VERSION', 'CRUNCHBASE_KEY', 'GITHUB_KEY', 'TWITTER_KEYS'];

    const outputFolder = landscape.name + new Date().getTime();
    const dockerCommand = `
      mkdir -p /root/${outputFolder}
      chmod -R 777 /root/${outputFolder}
      BASE_PATH=/root/build-image
      REPO_PATH=/root/${folder}
      OUTPUT_PATH=/root/${outputFolder}

      ${vars.map( (v) => `${v}=${process.env[v]}` ).join('\n')}

      docker run --rm -t \
        ${vars.map( (v) => ` -e ${v} `).join(' ')} \
        -v \${REPO_PATH}:/opt/repo \
        -v \${OUTPUT_PATH}:/dist \
        -v \${BASE_PATH}/run-build.sh:/usr/local/bin/build \
        -v \${BASE_PATH}/run-build-functions.sh:/usr/local/bin/run-build-functions.sh \
        buildbot /bin/bash -lc "build 'bash build.sh ${landscape.repo} ${landscape.name} master' && cp -r /opt/buildhome/repo/${landscape.name}/dist /dist"
    `;

    const bashCommand = `
      nocheck=" -o StrictHostKeyChecking=no "
      ssh -i /tmp/buildbot $nocheck ${remote} << 'EOSSH'
      ${dockerCommand}
EOSSH
      rsync -az -e "ssh -i /tmp/buildbot" ${remote}:/root/${outputFolder}/dist/ dist/${landscape.name}
    `

    console.info(`processing ${landscape.name} at ${landscape.repo}`);


    // run a build command remotely for a given repo

    function runIt() {
      return new Promise(function(resolve) {
        var spawn = require('child_process').spawn;
        var child = spawn('bash', ['-lc', bashCommand]);
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
          resolve({landscape, text: output.join(''), returnCode});
          //Here you can get the exit code of the script
        });
      });
    }

    const output  = await runIt();
    console.info(`Output from: ${landscape.landscape.name}, exit code: ${landscape.returnCode}`);
    console.info(landscape.text);
    return output;
  });
  if (_.find(results, (x) => x.returnCode !== 0)) {
    process.exit(1);
  }
  const redirects = results.map((result) => `/${result.landscape.name}/* /${result.landscape.name}/index.html 200`).join('\n');
  const index = results.map((result) => `<div><a href="${result.landscape.name}/"><h1>${result.landscape.name}</h1></a></div>`).join('\n');
  const robots = `
    User-agent: *
    Disallow: /
  `;
  require('fs').writeFileSync('dist/_redirects', redirects);
  require('fs').writeFileSync('dist/index.html', index);
  require('fs').writeFileSync('dist/robots.html', robots);


}
main();

