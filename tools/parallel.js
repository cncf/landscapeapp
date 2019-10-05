import Promise from 'bluebird';
import _ from 'lodash';

function runIt(task) {
  return new Promise(function(resolve) {
    var spawn = require('child_process').spawn;
    var child = spawn('bash', ['-lc', `npm run ${task}`]);
    const output = [];
    child.stdout.on('data', function(data) {
      const text = (data.toString('utf-8'));
      output.push(text);
      //Here is where the output goes
    });
    child.stderr.on('data', function(data) {
      const text = (data.toString('utf-8'));
      output.push(text);
      //Here is where the error output goes
    });
    child.on('close', function(returnCode) {
      resolve({task: task, text: output.join(''), returnCode});
      //Here you can get the exit code of the script
    });
  });
}

async function main() {
  const tasks = process.argv.slice(2);
  const result = await Promise.map(tasks, runIt);
  for (var r of result) {
    console.info(`Task: ${r.task}`, r.text);
  }
  const hasErrors = !! _.find(result, (r) => r.returnCode !== 0);
  process.exit(hasErrors ? 1 : 0);
}
main();
