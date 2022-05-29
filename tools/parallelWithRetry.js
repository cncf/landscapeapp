const Promise = require('bluebird');
const _ = require('lodash');

function runIt({task, showOutput}) {
  return new Promise(function(resolve) {
    let resolved = false;
    var spawn = require('child_process').spawn;
    var child = spawn('bash', ['-c', `yarn run ${task}`]);
    const output = [];
    child.stdout.on('data', function(data) {
      const text = (data.toString('utf-8'));
      output.push(text);
      if (showOutput) {
        process.stdout.write(text);
      }
      //Here is where the output goes
    });
    child.stderr.on('data', function(data) {
      const text = (data.toString('utf-8'));
      output.push(text);
      if (showOutput) {
        process.stdout.write(text);
      }
      //Here is where the error output goes
    });
    child.on('close', function(returnCode) {
      if (!resolved) {
        resolved = true;
        resolve({task: task, text: output.join(''), returnCode});
      }
      //Here you can get the exit code of the script
    });
    setTimeout(function() {
      if (!resolved) {
        resolved = true;
        console.info(`Timeout on ${task}`);
        resolve({task: task, text: output.join(''), returnCode: 60000});
      }
    }, 10 * 60 * 1000);
  });
}

async function main() {
  const tasks = process.argv.slice(2);
  const concurrency = process.env.PARALLEL ? 100 : 1;
  if (concurrency !== 1) {
    console.info(`Running ${tasks} in parallel`);
  }
  const result = await Promise.map(tasks, async function(task) {
    const maxAttempts = 3;
    for (let i = 0; i < maxAttempts; i++) {
      const output = await runIt({task, showOutput: concurrency === 1});
      if (output.returnCode === 0 || output.returnCode === 2) {//2 is reserved when we know that task failed
        return output;
      }
      if (i === maxAttempts - 1) {
        return output;
      } else {
        console.info(`Retrying ${task} one more time`);
      }
    }
  }, {
    concurrency: concurrency
  });
  if (concurrency !== 1) {
    for (var r of result) {
      console.info(`Task: ${r.task}`, r.text);
    }
  }
  const hasErrors = !! _.find(result, (r) => r.returnCode !== 0);
  process.exit(hasErrors ? 1 : 0);
}
main();
