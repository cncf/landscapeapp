import shortRepoName from '../src/utils/shortRepoName';
import rp from './rpRetry';
import { GithubClient } from './apiClients';


const cache = {};
export default async function getRepositoryInfo(url) {
  if (cache[url]) {
    return cache[url];
  }
  const repoName = shortRepoName(url);
  const apiUrl = `https://api.github.com/repos/${repoName}`;
  const apiInfo = await GithubClient.request({
    path: `repos/${repoName}`
  });
  cache[url] = apiInfo;
  return apiInfo;
}

const getLanguagesCache = {}
export async function getLanguages(url) {
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
export async function getWeeklyContributions(url) {
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
