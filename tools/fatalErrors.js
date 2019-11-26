import _ from 'lodash';
let fatalErrors = [];
export function hasFatalErrors() {
  return fatalErrors.length > 0;
}
export function setFatalError(errorText) {
  fatalErrors.push(errorText);
}

export async function reportFatalErrors() {
  if (!process.env.GITHUB_TOKEN) {
    console.info(`Can not report fatal errors, GITHUB_TOKEN not provided`);
    return;
  }

  const message = `Build failed because of:\n` + fatalErrors.join('\n');
  const repo = process.env.REPOSITORY_URL.split('/').slice(-2).join('/').split(':').slice(-1)[0];
  console.info(process.env.REPOSITORY_URL, repo);
  const pr = process.env.REVIEW_ID;
  if (!pr) {
    console.info('This netlify build is not associated with a pull request, can not report an error back to the github');
    return;
  }
  const rp = require('request-promise');
  const uri = `https://api.github.com/repos/${repo}/issues/${pr}/comments`;
  console.info(uri);
  const output = await rp({
    method: 'POST',
    uri: uri,
    headers: {
      'user-agent':'curl'
    },
    auth: {
        'user': 'CNCF-Bot',
        'pass': process.env.GITHUB_TOKEN
    },
    body: JSON.stringify({ body: '<pre>' + _.escape(message) + '</pre>'})
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
