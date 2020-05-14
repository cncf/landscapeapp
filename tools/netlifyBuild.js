import _ from 'lodash';
import Promise from 'bluebird';
import { spawn } from 'child_process';
import path from "path";
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
      rsync --exclude="node_modules" --exclude="dist" -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no  " . ${remote}:/root/${folder}
  `], {stdio: 'inherit'});
  if (result.status !== 0) {
    console.info(`Failed to rsync, exiting`);
    process.exit(1);
  }
  console.info('Rsync done');

  const results = await Promise.map(landscapesInfo.landscapes, async function(landscape) {

    const vars = ['NODE_VERSION', 'RUBY_VERSION', 'CRUNCHBASE_KEY', 'GITHUB_KEY', 'TWITTER_KEYS'];

    const outputFolder = landscape.name + new Date().getTime();
    const nvmrc = require('fs').readFileSync('.nvmrc', 'utf-8').trim();
    const r = () => _.random(30) + 10;
    const buildCommand = `mkdir -p /opt/buildhome/repo && cp -r /opt/repo /opt/buildhome && cd /opt/buildhome/repo && export NETLIFY=1 && . ~/.nvm/nvm.sh && (nvm install ${nvmrc} || (sleep ${r()} && nvm install ${nvmrc}) || (sleep ${r()} && nvm install ${nvmrc})) && nvm use && bash build.sh ${landscape.repo} ${landscape.name} master && cp -r /opt/buildhome/repo/${landscape.name}/dist /dist`
    const dockerCommand = `
      mkdir -p /root/${outputFolder}
      chmod -R 777 /root/${outputFolder}
      BASE_PATH=/root/build-image
      REPO_PATH=/root/${folder}
      OUTPUT_PATH=/root/${outputFolder}

      docker run --rm -t \
        ${vars.map( (v) => ` -e ${v}="${process.env[v]}" `).join(' ')} \
        -e NVM_NO_PROGRESS=1 \
        -e PARALLEL=TRUE \
        -v \${REPO_PATH}:/opt/repo \
        -v \${OUTPUT_PATH}:/dist \
        -v \${BASE_PATH}/run-build.sh:/usr/local/bin/build \
        -v \${BASE_PATH}/run-build-functions.sh:/usr/local/bin/run-build-functions.sh \
        buildbot /bin/bash -lc "${buildCommand}"
    `;

    const bashCommand = `
      nocheck=" -o StrictHostKeyChecking=no "
      ssh -i /tmp/buildbot $nocheck ${remote} << 'EOSSH'
      ${dockerCommand}
EOSSH
      rsync -az -e "ssh -i /tmp/buildbot  -o StrictHostKeyChecking=no " ${remote}:/root/${outputFolder}/dist/ dist/${landscape.name}
    `

    // console.info(bashCommand);
    console.info(`processing ${landscape.name} at ${landscape.repo}`);


    // run a build command remotely for a given repo

    const runIt = () => {
      return new Promise(resolve => {
        let child = spawn('bash', ['-lc', bashCommand]);
        let output = '';
        child.stdout.on('data', data => output += data)
        child.stderr.on('data', data => output += data)
        child.on('close', returnCode => {
          resolve({landscape, text: maskSecrets(output.toString('utf-8')), returnCode});
        });
      });
    }

    const output  = await runIt();
    console.info(`Output from: ${output.landscape.name}, exit code: ${output.returnCode}`);
    const lines = output.text.split('\n');
    const index = _.findIndex(lines, (line) => line.match(/added \d+ packages in/));
    const filteredLines = lines.slice(index !== -1 ? index : 0).join('\n');
    console.info(filteredLines);
    return output;
  });
  if (results.find(({ returnCode, landscape }) => landscape.required && returnCode !== 0)) {
    console.log("At least one required landscape failed, exiting build")
    process.exit(1);
  }
  const redirects = results.map((result) => `
    /${result.landscape.name}/ /${result.landscape.name}/prerender.html 200!
    /${result.landscape.name} /${result.landscape.name}/prerender.html 200!
    /${result.landscape.name}/* /${result.landscape.name}/index.html 200
  `).join('\n');
  const index = results.map(result => {
    return `<div>
        ${ result.returnCode === 0 ?
          `<a href="${result.landscape.name}/"><h1>${result.landscape.name} (OK)</h1></a>` :
          `<h1>${result.landscape.name} (FAILED)</h1>`}
        </div>`
  }).join('\n');
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

