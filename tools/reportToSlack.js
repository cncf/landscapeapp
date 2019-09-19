import rp from 'request-promise';
import _ from 'lodash';

export async function report({ returnCode, logs, slackChannel}) {
  const url = `https://hooks.slack.com/services/${slackChannel}`;
  const errorsAndWarnings = JSON.parse(require('fs').readFileSync('/tmp/landscape.json', 'utf-8'));
  console.info(errorsAndWarnings);
  const errorStatus = returnCode === 0 ? 'SUCCESS' : 'FAILURE'
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
    const lines = logs.join('').split('\n');
    const lastYarnLine = lines.indexOf('Processing the tree');
    const remainingLines = lines.slice(lastYarnLine);
    return remainingLines.join('\n');
  })();

  const checkLinksData = (function() {
    try {
      return JSON.parse(require('fs').readFileSync('/tmp/links.json', 'utf-8'));
    } catch(ex) {
      return {
        messages: '',
        numberOfRedirects: '',
        numberOfErrors: ''
      }
    }
  })();

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



  const result = await rp({
    method: 'POST',
    json: payload,
    url: url
  });
}
