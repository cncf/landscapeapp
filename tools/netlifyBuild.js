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

  for (var landscape of landscapesInfo.landscapes) {
    if (landscape.netlify !== 'full') {
      console.info(`Skipping a build for ${landscape.name} because it has netlify: ${landscape.netlify}`);
      continue;
    }
    console.info(`processing ${landscape.name} at ${landscape.repo}`);


    function runIt() {
      return new Promise(function(resolve) {
        var spawn = require('child_process').spawn;
        var child = spawn('bash', ['build.sh', landscape.repo, landscape.name, 'master']);
        child.stdout.on('data', function(data) {
          const text = maskSecrets(data.toString('utf-8'));
          process.stdout.write(text);
          //Here is where the output goes
        });
        child.stderr.on('data', function(data) {
          const text = maskSecrets(data.toString('utf-8'));
          process.stdout.write(text);
          //Here is where the error output goes
        });
        child.on('close', function(returnCode) {
          resolve({returnCode});
          //Here you can get the exit code of the script
        });
      });
    }

    const {returnCode} = await runIt();
    console.info(`${landscape.name} returned with a ${returnCode}`);

  }
}
main();

