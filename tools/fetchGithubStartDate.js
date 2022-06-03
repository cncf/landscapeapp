const Promise = require('bluebird');
const _ = require('lodash');
const debug = require('debug')('github');
const colors = require('colors');

const { getRepoStartDate } = require('./githubDates');
const { errorsReporter } = require('./reporter');
const { getRepositoryInfo } = require('./getRepositoryInfo');
const { makeReporter } = require('./progressReporter');
const { cacheKey, getRepos, fetchGithubOrgs } = require('./repos');

const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;
const { addError, addFatal } = errorsReporter('github');


module.exports.fetchStartDateEntries = async function({cache, preferCache}) {
  const githubOrgs = (await fetchGithubOrgs(preferCache))
    .map(org => ({ ...org.data, ...org.github_start_commit_data}))
  const repos = [...getRepos(), ...githubOrgs.filter(org => !org.cached).map(org => org.repos).flat()]
  const errors = [];
  const fatalErrors = [];
  const reporter = makeReporter();
  const result =  await Promise.map(repos, async function(repo) {
    const cachedEntry = cache[cacheKey(repo.url, repo.branch)];
    if (cachedEntry && preferCache) {
      debug(`Cache found for ${repo.url}`);
      reporter.write('.');
      return { ...cachedEntry, cached: true }
    }
    if (repo.url.indexOf('https://github.com') === -1 || (preferCache && repo.parent && cache[repo.parent])) {
      return {}
    }
    debug(`Cache not found for ${repo.url}`);
    await Promise.delay(1 * 1000);
    const url = repo.url;
    try {
      const apiInfo  = await getRepositoryInfo(repo.url);
      const branch = repo.branch || apiInfo.default_branch;
      const repoName = url.split('/').slice(3,5).join('/');
      const { date, commitLink } = await getRepoStartDate({repo: repoName, branch});
      reporter.write(cacheMiss("*"));
      return ({url: repo.url, start_commit_link: commitLink, start_date: date});
    } catch (ex) {
      if (cachedEntry) {
        reporter.write(error('E'));
        errors.push(`Cannot fetch: ${repo.url} `, ex.message.substring(0, 200));
        return cachedEntry;
      } else {
        reporter.write(fatal('F'));
        fatalErrors.push(`No cached entry, and ${repo.url} has issues with start date fetching:, ${ex.message.substring(0, 200)}`);
        return null;
      }
    }
  }, {concurrency: 20});
  reporter.summary();
  _.each(errors, (x) => addError(x));
  _.each(fatalErrors, (x) => addFatal(x));
  return [...result, ...githubOrgs];
}
