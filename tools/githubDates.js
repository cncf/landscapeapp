const { GithubClient } = require('./apiClients');

module.exports.getReleaseDate = async function({repo}) {
  const releases = await GithubClient.request({ path: `/repos/${repo}/releases` });

  if (releases.length > 0) {
    return releases[0].published_at;
  }
}

module.exports.getRepoLatestDate = async function({repo, branch}) {
  const branchSha = await getBranchSha(repo, branch);
  const commits = await GithubClient.request({ path: `/repos/${repo}/commits?sha=${branchSha}` });
  const firstCommit = commits[0];
  const commitLink = (new URL(firstCommit.html_url)).pathname;
  return { date: firstCommit.commit.committer.date, commitLink: commitLink };
}

const getBranchSha = async (repo, branch) => {
  const { commit } = await GithubClient.request({ path: `/repos/${repo}/branches/${branch}` });
  return commit.sha;
}

const getUrlFromLinkHeader = (link, rel) => {
  if (link) {
    return link.split(',')
      .find((text) => text.indexOf(`rel="${rel}"`) > -1)
      .split(';')[0]
      .replace(/<|>/g, '');
  }
}

const getCommitsLastPagePath = async (repo, branchSha) => {
  const path = `/repos/${repo}/commits?sha=${branchSha}`;

  const response = await GithubClient.request({ path, method: 'HEAD', resolveWithFullResponse: true });
  const { link } = response.headers
  const url = getUrlFromLinkHeader(link, 'last');
  if (!url) {
    return path;
  }
  const { pathname, search } = new URL(url);
  return pathname + search;
}

module.exports.getRepoStartDate = async function({repo, branch}) {
  const branchSha = await getBranchSha(repo, branch);
  const commitsLastPagePath = await getCommitsLastPagePath(repo, branchSha);
  const commits = await GithubClient.request({ path: commitsLastPagePath })
  const lastCommit = commits[commits.length - 1];
  const commitLink = (new URL(lastCommit.html_url)).pathname;
  return { date: lastCommit.commit.author.date, commitLink: commitLink };
}
