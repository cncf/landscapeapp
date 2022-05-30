const { getRepoLatestDate } = require('./githubDates.js');
async function main() {
  for (var i = 0; i < 4000; i++) {
    const data = await getRepoLatestDate({repo: 'gluster/glusterfs', branch: 'master'});
    console.info(data.date);
  }
}
main();
