import { report } from './reportToSlack';

const landscapesInfo = require('js-yaml').safeLoad(require('fs').readFileSync('landscapes.yml'));

async function main() {
  for (var landscape of landscapesInfo.landscapes) {
    console.info(`processing ${landscape.name} at ${landscape.repo}`);
    const settingsFileName = `${process.env.HOME}/${landscape.name}.env`
    if (!require('fs').existsSync(settingsFileName)) {
      console.info(`Warning: settings file ${settingsFileName} for ${landscape.name} does not exist, we will not be able to report to slack`);
    };
    const globalSettingsFileName = `${process.env.HOME}/landscapes.env`
    const content = require('fs').readFileSync(globalSettingsFileName, 'utf-8');
    const secrets = content.split('\n').map(function(line) {
      return line.split('=')[1];
    }).filter( (x) => !!x);

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
  git clone https://$GITHUB_USER:$GITHUB_TOKEN@github.com/${landscape.repo} /repo
  cd /repo
  npm install interactive-landscape@latest && (export PROJECT_PATH="$PWD"; npm explore interactive-landscape -- npm run update) && npm explore interactive-landscape -- npm run check-links && git add . && git config --global user.email "info@cncf.io" && git config --global user.name "CNCF-bot" && git commit -m "Automated update by CNCF-bot" && git push origin HEAD
  `;

    function runIt() {
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
    for (var i = 0; i < 3; i ++) {
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

    const { slackChannel, icon_url, name } = (function() {
      try {
        const settings = require('js-yaml').safeLoad(require('fs').readFileSync('/repo/settings.yml'));
        const slackChannel = settings.global.slack_channel;
        const icon_url = `${settings.global.website}/favicon.png`
        const name = settings.global.short_name
        return { slackChannel, icon_url, name };
      } catch(ex) {
        console.info('Failed to extract slack channel');
        return '';
      }
    })();
    console.info({slackChannel: maskSecrets(slackChannel || '')});

    const hookArgs = { returnCode, logs, icon_url, name }

    if (slackChannel) {
      await report({ ...hookArgs, slackChannel });
    }

    if (process.env.SLACK_ERROR_CHANNEL) {
      await report({ ...hookArgs, slackChannel: process.env.SLACK_ERROR_CHANNEL, onlyErrors: true });
    }
  }
}
main();

