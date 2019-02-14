import rp from 'request-promise';
import _ from 'lodash';

const url = `https://hooks.slack.com/services/${process.env.SLACK_CHANNEL}`;
const errorsAndWarnings = JSON.parse(require('fs').readFileSync('/tmp/landscape.json', 'utf-8'));
console.info(errorsAndWarnings);
console.info(process.env.ERROR_STATUS);
const errorStatus = process.env.ERROR_STATUS === '0' ? 'SUCCESS' : 'FAILURE'
const fields = _.map(_.keys(errorsAndWarnings.warnings), function(key) {
  const value = errorsAndWarnings.warnings[key];
  const kind = errorsAndWarnings.errors[key] ? 'errors' : 'warnings';
  return {
    title: `${key} ${kind}:`,
    value: value,
    short: true
  }
});

const logContent = (function() {
  const text = require('fs').readFileSync(process.env.LOGFILE_PATH, 'utf-8');
  const lines = text.split('\n');
  const lastYarnLine = lines.indexOf('Processing the tree');
  const remainingLines = lines.slice(lastYarnLine);
  return remainingLines.join('\n');
})();

const checkLinksData = JSON.parse(require('fs').readFileSync('/tmp/links.json', 'utf-8'));


const payload = {
  text: `Update from ${new Date().toISOString()} finished with ${errorStatus}`,
  attachments: [{
    title: 'Log File: (update.log)',
    text: logContent,
    fields: fields
  }, {
    title: 'Check links result',
    text: checkLinksData.messages,
    fields: [{
      title: '# of Redirects',
      value: checkLinksData.numberOfRedirects
    }, {
      title: '# of Errors',
      value: checkLinksData.numberOfErrors
    }]
  }]
};



async function main() {
  const result = await rp({
    method: 'POST',
    json: payload,
    url: url
  });
  console.info(result);

}
main();
