import shortRepoName from '../src/utils/shortRepoName';
import rp from './rpRetry';

const cache = {};
export default async function getRepositoryInfo(url) {
  if (cache[url]) {
    return cache[url];
  }
  const repoName = shortRepoName(url);
  const apiUrl = `https://api.github.com/repos/${repoName}?access_token=${process.env.GITHUB_KEY}`;
  const apiInfo = await rp({
    url: apiUrl,
    json: true,
    headers: {
      'User-Agent': 'landscapeapp updater'
    }
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
  const apiUrl = `https://api.github.com/repos/${repoName}/languages?access_token=${process.env.GITHUB_KEY}`;
  const apiInfo = await rp({
    url: apiUrl,
    json: true,
    headers: {
      'User-Agent': 'landscapeapp updater'
    }
  });
  getLanguagesCache[url] = apiInfo;
  return apiInfo;
}
