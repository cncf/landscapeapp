import { getRepoLatestDate } from './githubDates.js'
import { GithubClient } from './apiClients';
async function main() {
  for (var i = 0; i < 4000; i++) {
    const data = await getRepoLatestDate({repo: 'gluster/glusterfs', branch: 'master'});
    console.info(data.date);
  }
}
main();
