import rp from 'request-promise';
import _ from 'lodash';

export async function report({ returnCode, reportUrl, messages, slackChannel, icon_url, name, onlyErrors = false }) {
  const url = `https://hooks.slack.com/services/${slackChannel}`;
  const errorStatus = returnCode === 0 ? 'SUCCESS' : 'FAILURE'

  const errorsCount = messages.filter( (x) => x.type === 'error').length;
  const fatalErrorsCount = messages.filter( (x) => x.type === 'fatal').length;

  if (returnCode === 0 && onlyErrors) {
    return
  }

  const payload = {
    text: `
      Update from ${new Date().toISOString()} finished with ${errorStatus}
      Full report available at ${reportUrl}
      Errors: ${fatalErrorsCount}
      Warnings: ${errorsCount}
    `,
    username: `${name} Landscape Update`,
    icon_url,
    attachments
  };

  const result = await rp({
    method: 'POST',
    json: payload,
    url: url
  });
}
