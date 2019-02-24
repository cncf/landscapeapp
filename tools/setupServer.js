import { settings } from './settings';
import ejs from 'ejs';
const file = require('fs').readFileSync('update_server/setup.template', 'utf-8');

const values = {
  name: settings.global.short_name,
  repo: settings.global.repo,
  ip: settings.update_server.ip,
  update_hour: settings.update_server.update_hour,
  update_minute: settings.update_server.update_minute
}
const content = ejs.render(file, values);
require('fs').writeFileSync('/tmp/update_server.bash', content);
var spawn = require('child_process').spawn;
var child = spawn('bash', ['/tmp/update_server.bash']);
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
