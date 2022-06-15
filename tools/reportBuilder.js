// report builder generates an html page which makes a neat summary of
// a daily autoupdate job
// Raw output is converted to the colored html output
// Warning and Errors are later put to the individual sections
// Output from the check-links is put to the individual sections

// messages are stored in /tmp/landscape.json
// links results are stored in /tmp/links.json

const anchorme = require('anchorme').default;
const run = function(x) {
  return (require('child_process').execSync(x).toString());
}
module.exports.generateReport = function({logs, name, messages, status, startTime}) {
  const startTimeFormatted = new Date(startTime).toISOString().substring(0, 16);
  require('fs').writeFileSync('/tmp/logfile.txt', logs);
  const formattedLogs = run('cat /tmp/logfile.txt | aha --no-header');

  const renderMessage = function(message) {
    return `<div style="color:${message.type === 'fatal' ? 'red' : 'inherit'}"><pre>${message.text}<pre></div>`;
  }

  const categories = ['general', 'image', 'github', 'crunchbase', 'yahoo', 'bestpractices', 'link', 'twitter'];
  const messagesByCategories = {};
  for (var category of categories) {
    messagesByCategories[category] = messages.filter( (x) => x.category === category);
  }


  return anchorme(`
  <h1> Daily autoupdate report on ${name} from ${startTimeFormatted} </h1>
  <h1 style="color: ${status ? 'green' : 'red' }">${status ? 'Success' : 'Failure'}</h1>

  ${categories.map(function(category) {
    if (messagesByCategories[category].length > 0) {
      return `
        <h2>${category}</h2>
        <div id="${category}">
           ${messagesByCategories[category].map(renderMessage).join('')}
        </div>
      `;
    } else {
      return '';
    }
  }).join('<br>')}

  <h1> Full Logs: </h1>
  <pre>
${formattedLogs}
  </pre>
  `) + `
  <script>${require('fs').readFileSync(__dirname + '/reportBuilderScript.js', 'utf-8')}</script>
  `;
}
