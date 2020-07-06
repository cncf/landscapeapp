import rp from 'request-promise';

const maxHours = 4;
function reportProblem() {
}
export default async function check() {
  const result = await rp(`https://api.github.com/repos/cncf/landscapeapp/branches/master`, {
    headers: {'User-Agent': 'curl'},
    json: true
  });
  const remoteDate = result.commit.commit.committer.date;
  const localDate = require('child_process').execSync('git show -s --format=%ci master').toString().trim()

  console.info(new Date(localDate), new Date(remoteDate));
  if ( new Date(remoteDate).getTime() !== new Date(localDate).getTime()) {
    console.error(`
!!!Fatal Error!!!
Your copy of cncf/landscapeapp repo is not up to date!
The latest commit to a master branch occurred at ${remoteDate.toISOString()}
Your latest commit is dated ${localDate.toISOString()}
Trying to pull a latest version for you
    `);
    const gitPull = require('child_process').execSync('git pull --ff-only').toString().trim();
    console.error(gitPull);
    console.error(`
Tried to update to the latest version. Now, please start a script again
    `);
  }
}
check();
