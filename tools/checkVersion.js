const axios = require('axios');

module.exports.checkVersion = async function() {
  try {
    const { data:result } = await axios({
      url: `https://api.github.com/repos/cncf/landscapeapp/branches/master`,
      headers: {'User-Agent': 'curl'}
    })
    const currentBranch = require('child_process').execSync(`git rev-parse --abbrev-ref HEAD`).toString().trim();
    if (currentBranch !== 'master') {
      return;
    }
    const remoteDate = result.commit.commit.committer.date;
    const localDate = require('child_process').execSync('git show -s --format=%ci master').toString().trim()

    if ( new Date(remoteDate).getTime() !== new Date(localDate).getTime()) {
      if (process.env.SKIP_VERSION_CHECK) {
        console.info(`Skipping version check`);
        return;
      }
      console.error(`
!!!Fatal Error!!!'
Your copy of cncf/landscapeapp repo is not up to date!
The latest commit to a master branch occurred at ${new Date(remoteDate).toISOString()}
Your latest commit is dated ${new Date(localDate).toISOString()}
If you are sure that is ok, run this command: "export SKIP_VERSION_CHECK=1" and rerun the script again
You can use the command below to update your landscapeapp repo to the latest master branch:
    (cd ${process.cwd()} && git pull)
After updating the landscapeapp repo, rerun the script again
`);
      process.exit(1);
    }
  } catch(ex) {
    console.warn('Warning: please ensure that your landscapeapp repo is up to date');
  }
}
