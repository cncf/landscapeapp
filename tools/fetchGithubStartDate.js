import { setFatalError } from './fatalErrors';
const Promise = require('bluebird');
import _ from 'lodash';
import colors from 'colors';
import { addWarning, addError } from './reporter';
import getRepositoryInfo from './getRepositoryInfo';
import makeReporter from './progressReporter';
import { cacheKey, getRepos } from './repos';

const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;
const debug = require('debug')('github');

import { getRepoStartDate } from './githubDates';

export async function fetchStartDateEntries({cache, preferCache}) {
  const repos = getRepos();
  const errors = [];
  const reporter = makeReporter();
  const result =  await Promise.map(repos, async function(repo) {
    const cachedEntry = cache[cacheKey(repo.url, repo.branch)];
    if (cachedEntry && preferCache) {
      debug(`Cache found for ${repo.url}`);
      reporter.write('.');
      return { ...cachedEntry, cached: true }
    }
    if (preferCache && repo.parent && cache[repo.parent]) {
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
        addWarning('githubStartDate');
        reporter.write(error('E'));
        debug(`Fetch failed for ${repo.url}, attempt to use a cached entry`);
        errors.push(`Cannot fetch: ${repo.url} `, ex.message.substring(0, 200));
        return cachedEntry;
      } else {
        addError('githubStartDate');
        reporter.write(fatal('F'));
        debug(`Fetch failed for ${repo.url}, can not use a cached entry`);
        errors.push(fatal(`No cached entry, and ${repo.url} has issues with start date fetching:, ${ex.message.substring(0, 200)}`));
        setFatalError(`No cached entry, and ${repo.url} has issues with start date fetching:, ${ex.message.substring(0, 200)}`);
        return null;
      }
    }
  }, {concurrency: 20});
  reporter.summary();
  _.each(errors, (x) => console.info(x));
  return result;
}
