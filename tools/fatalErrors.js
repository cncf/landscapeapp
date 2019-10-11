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
  const repo = process.env.REPOSITORY_URL.split('github.com/')[1];
  const pr = process.env.REVIEW_ID;
  const rp = require('request-promise');
  const uri = `https://api.github.com/repos/${repo}/issues/${pr}/comments`;
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
    body: JSON.stringify({ body: message})
  });
}

async function main() {
  fatalErrors = ['FATAL: error number 1', 'FATAL: error number 2'];
  await reportFatalErrors();
}
main();
