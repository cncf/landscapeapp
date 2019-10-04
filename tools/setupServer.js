import ejs from 'ejs';
const file = require('fs').readFileSync('update_server/setup.bash', 'utf-8');
const landscapes = require('js-yaml').safeLoad(require('fs').readFileSync('landscapes.yml'));

const values = {
  ip: landscapes.ip,
}

const content = ejs.render(file, values);
require('fs').writeFileSync('/tmp/update_server.bash', content);
var spawn = require('child_process').spawn;
var child = spawn('bash', ['/tmp/update_server.bash'], { maxBuffer: 100 * 1024 * 1024});
child.stdout.on('data', function(data) {
    console.log(data.toString('utf-8'));
    //Here is where the output goes
});
child.stderr.on('data', function(data) {
    console.log(data.toString('utf-8'));
    //Here is where the error output goes
});
child.on('close', function(code) {
    console.log('done');
    //Here you can get the exit code of the script
});
