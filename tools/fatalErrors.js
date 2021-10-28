import _ from 'lodash';
import axios from 'axios'
import errorsReporter, { getMessages } from './reporter';
const { addFatal } = errorsReporter('general');

export function hasFatalErrors() {
  return getMessages().filter( (x) => x.type === 'fatal') > 0;
}

export function setFatalError(errorText) {
  addFatal(errorText);
}

export async function reportFatalErrors() {
  if (!process.env.GITHUB_TOKEN) {
    console.info(`Can not report fatal errors, GITHUB_TOKEN not provided`);
    return;
  }
  if (!process.env.REPOSITORY_URL) {
    console.info(`Can not report fatal errors, REPOSITORY_URL not provided`);
    return;
  }

  const fatalErrors = getMessages().filter( (x) => x.type === 'fatal').map( (x) => x.text);

  const message = `Build failed because of:\n` + fatalErrors.join('\n');
  const repo = process.env.REPOSITORY_URL.split('/').slice(-2).join('/').split(':').slice(-1)[0];
  console.info(process.env.REPOSITORY_URL, repo);
  const pr = process.env.REVIEW_ID;
  if (!pr) {
    console.info('This netlify build is not associated with a pull request, can not report an error back to the github');
    return;
  }
  const url = `https://api.github.com/repos/${repo}/issues/${pr}/comments`;
  console.info(url);
  await axios({
    method: 'POST',
    url,
    headers: {
      'user-agent':'curl'
    },
    auth: {
        username: 'CNCF-Bot',
        password: process.env.GITHUB_TOKEN
    },
    data: { body: '<pre>' + _.escape(message) + '</pre>'}
  });
}

async function main() {
  fatalErrors = ['FATAL: <div> *b* </div> error number 1', 'FATAL: error number 2'];
  await reportFatalErrors();
}
// uncomment and set env vars to debug
if (process.env.TESTITNOW) {
  main();
}
