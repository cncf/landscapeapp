const { report } = require('./reportToSlack');
const { generateReport } = require('./reportBuilder');

const landscapesInfo = require('js-yaml').load(require('fs').readFileSync('landscapes.yml'));

async function main() {
  for (var landscape of landscapesInfo.landscapes) {
    console.info(`processing ${landscape.name} at ${landscape.repo}`);
    const globalSettingsFileName = `${process.env.HOME}/landscapes.env`
    const content = require('fs').readFileSync(globalSettingsFileName, 'utf-8');
    const secrets = content.split('\n').map(function(line) {
      return line.split('=')[1];
    }).filter( (x) => !!x);

    const key2 = content.split('\n').map(function(line) {
      return line.split('KEY2=')
    }).filter( (x) => x.length === 2)[0][1].replaceAll("'", "");

    require('fs').mkdirSync(process.env.HOME + '/.ssh', { recursive: true});
    require('fs').writeFileSync(process.env.HOME + '/.ssh/bot2',
        "-----BEGIN OPENSSH PRIVATE KEY-----\n" +
        key2.replaceAll(" ","\n") +
        "\n-----END OPENSSH PRIVATE KEY-----\n\n"
    );
    require('fs').chmodSync(process.env.HOME + '/.ssh/bot2', 0o600);

    const key3 = content.split('\n').map(function(line) {
      return line.split('KEY3=')
    }).filter( (x) => x.length === 2)[0][1].replaceAll("'", "");

    require('fs').mkdirSync(process.env.HOME + '/.ssh', { recursive: true});
    require('fs').writeFileSync(process.env.HOME + '/.ssh/bot3',
        "-----BEGIN RSA PRIVATE KEY-----\n" +
        key3.replaceAll(" ","\n") +
        "\n-----END RSA PRIVATE KEY-----\n\n"
    );
    require('fs').chmodSync(process.env.HOME + '/.ssh/bot3', 0o600);


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

    const bashFileContent = `
  . "${globalSettingsFileName}"
  set -e
  . ~/.nvm/nvm.sh
  rm -rf /repo || true
  GIT_SSH_COMMAND='ssh -i ~/.ssh/bot2 -o IdentitiesOnly=yes' timeout 120s git clone git@github.com:${landscape.repo}.git /repo || GIT_SSH_COMMAND='ssh -i ~/.ssh/bot3 -o IdentitiesOnly=yes' timeout 120s git clone git@github.com:${landscape.repo}.git /repo
  cd /landscapeapp
  export PROJECT_PATH=/repo
  npm install -g yarn
  NETLIFY=1 yarn run light-update
  cp files/landscape.netlify.toml /repo/netlify.toml
  cd /repo
  git add .
  git config --global user.email "info@cncf.io"
  git config --global user.name "CNCF-bot"
  git commit -s -m "Automated crunchbase update by CNCF-bot"
  GIT_SSH_COMMAND='ssh -i ~/.ssh/bot2 -o IdentitiesOnly=yes' git push origin HEAD || GIT_SSH_COMMAND='ssh -i ~/.ssh/bot3 -o IdentitiesOnly=yes' git push origin HEAD
  cd /landscapeapp
  export PROJECT_PATH=/repo
  NETLIFY=1 yarn run update
  cp files/landscape.netlify.toml /repo/netlify.toml
  cd /repo
  git add .
  git config --global user.email "info@cncf.io"
  git config --global user.name "CNCF-bot"
  git commit -s -m "Automated full update by CNCF-bot"
  GIT_SSH_COMMAND='ssh -i ~/.ssh/bot2 -o IdentitiesOnly=yes' git push origin HEAD || GIT_SSH_COMMAND='ssh -i ~/.ssh/bot3 -o IdentitiesOnly=yes' git push origin HEAD
  `;

    const startTime = new Date().getTime();

    const runIt = function() {
      return new Promise(function(resolve) {
        let logs = [];
        var spawn = require('child_process').spawn;
        var child = spawn('bash', ['-lc', bashFileContent ]);
        child.stdout.on('data', function(data) {
          const text = maskSecrets(data.toString('utf-8'));
          logs.push(text);
          process.stdout.write(text);
          //Here is where the output goes
        });
        child.stderr.on('data', function(data) {
          const text = maskSecrets(data.toString('utf-8'));
          logs.push(text);
          process.stdout.write(text);
          //Here is where the error output goes
        });
        child.on('close', function(returnCode) {
          resolve({returnCode, logs});
          //Here you can get the exit code of the script
        });
      });
    }

    let returnCode;
    let logs;
    for (var i = 0; i < 1; i ++) {
      const result = await runIt();
      returnCode = result.returnCode;
      logs = result.logs;
      console.info(`${landscape.name} returned with a ${returnCode}`);
      if (returnCode === 0) {
        break;
      } else {
        console.info(`Retrying!`);
      }
    }


    require('fs').writeFileSync(`${process.env.HOME}/${landscape.name}.log`, logs.join(''));
    const settings = require('js-yaml').load(require('fs').readFileSync('/repo/settings.yml'));

    const { slackChannel, icon_url, name } = (function() {
      try {
        const slackChannel = settings.global.slack_channel;
        const icon_url = `${settings.global.website}/favicon.png`
        const name = settings.global.short_name
        return { slackChannel, icon_url, name };
      } catch(ex) {
        console.info('Failed to extract slack channel');
        return '';
      }
    })();

    let messages = [];
    try {
      messages = JSON.parse(require('fs').readFileSync('/tmp/landscape.json', 'utf-8'));
    } catch(ex) {

    }
    const htmlReport = generateReport({
      logs: logs.join(''),
      messages: messages,
      name: settings.global.short_name || landscape.name,
      status: returnCode === 0,
      endTime: new Date().getTime(),
      startTime: startTime
    });
    const reportTime = new Date(startTime).toISOString().substring(0, 16).replace(':','_').replace(':','_');

    const fileName = `${landscape.name}-${reportTime}.html`;
    const fullPath = `/var/www/html/${fileName}`;
    const latestPath = `/var/www/html/${landscape.name}.html`;
    const reportUrl = `http://${landscapesInfo.ip}/${fileName}`;
    require('fs').writeFileSync(fullPath, htmlReport);
    require('fs').writeFileSync(latestPath, htmlReport);

    console.info({slackChannel: maskSecrets(slackChannel || '')});

    const hookArgs = { returnCode, reportUrl, messages: messages, icon_url, name }

    if (slackChannel) {
      await report({ ...hookArgs, slackChannel });
    }

    if (process.env.SLACK_ERROR_CHANNEL) {
      await report({ ...hookArgs, slackChannel: process.env.SLACK_ERROR_CHANNEL, onlyErrors: true });
    }
  }
}
main();

