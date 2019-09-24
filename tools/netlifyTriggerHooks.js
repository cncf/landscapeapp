const landscapesInfo = require('js-yaml').safeLoad(require('fs').readFileSync('landscapes.yml'));

async function main() {
  for (var landscape of landscapesInfo.landscapes) {
    console.info(`triggering a hook  for ${landscape.name}`);


    function runIt() {
      return new Promise(function(resolve) {
        var spawn = require('child_process').spawn;
        var child = spawn('bash', ['-lc', `curl -X POST -d {} https://api.netlify.com/build_hooks/${landscape.hook}`]);
        child.stdout.on('data', function(data) {
          const text = (data.toString('utf-8'));
          process.stdout.write(text);
          //Here is where the output goes
        });
        child.stderr.on('data', function(data) {
          const text = (data.toString('utf-8'));
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

