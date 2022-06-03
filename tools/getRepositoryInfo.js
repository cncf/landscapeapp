const  { shortRepoName } = require('../src/utils/shortRepoName');
const { GithubClient } = require('./apiClients');


const cache = {};
module.exports.getRepositoryInfo = async function(url) {
  if (cache[url]) {
    return cache[url];
  }
  const repoName = shortRepoName(url);
  const apiInfo = await GithubClient.request({
    path: `repos/${repoName}`
  });
  cache[url] = apiInfo;
  return apiInfo;
}

const getLanguagesCache = {}
module.exports.getLanguages = async function(url) {
  if (getLanguagesCache[url]) {
    return getLanguagesCache[url];
  }
  const repoName = shortRepoName(url);
  const apiInfo = await GithubClient.request({
    path: `repos/${repoName}/languages`
  });
  getLanguagesCache[url] = apiInfo;
  return apiInfo;
}

const weeklyContributionsCache = {}
module.exports.getWeeklyContributions = async function(url) {
  if (weeklyContributionsCache[url]) {
    return weeklyContributionsCache[url];
  }
  const repoName = shortRepoName(url);
  const apiInfo = await GithubClient.request({
    path: `repos/${repoName}/stats/participation`
  });
  weeklyContributionsCache[url] = apiInfo;
  return apiInfo;
}
