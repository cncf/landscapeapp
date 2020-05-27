import { setFatalError } from './fatalErrors';
import colors from 'colors';
const Promise = require('bluebird');
import _ from 'lodash';
import rp from './rpRetry';
import { JSDOM } from 'jsdom';
import { addError, addWarning } from './reporter';
import makeReporter from './progressReporter';
const debug = require('debug')('github');
import shortRepoName from '../src/utils/shortRepoName';
import getRepositoryInfo , { getLanguages, getWeeklyContributions}  from './getRepositoryInfo';
import { cacheKey, getRepos } from './repos'
import { GithubClient} from './apiClients'

import { getRepoLatestDate, getReleaseDate } from './githubDates';

const githubColors = JSON.parse(require('fs').readFileSync('tools/githubColors.json', 'utf-8'));

const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;

const getContributorsCount = async (repoUrl) => {
  var response = await rp({
    uri: `${repoUrl}/contributors_size`,
    followRedirect: true,
    timeout: 30 * 1000,
    simple: true
  });
  const dom = new JSDOM(response);
  const doc = dom.window.document;
  var element = doc.querySelector('.num');
  var count = element.textContent.replace(/[^\d]/g, '').trim();
  return parseInt(count);
};

const getContributorsList = async (repo, page = 1) => {
  const per_page = 100 // maximum allowed by Github
  const response = await GithubClient.request({ path: `/repos/${repo}/contributors`, params: { page, per_page }})
  const contributors = response.map(contributor => contributor.login)

  return contributors.concat(contributors.length === per_page ? await getContributorsList(repo, page + 1) : [])
}

export async function fetchGithubEntries({cache, preferCache}) {
  const repos = getRepos();
  debug(cache);
  const errors = [];
  const reporter = makeReporter();
  const result = await Promise.map(repos, async function(repo) {
    const cachedEntry = cache[cacheKey(repo.url, repo.branch)]
    if (cachedEntry && preferCache) {
      debug(`Cache ${cachedEntry} found for ${repo.url}`);
      reporter.write('.');
      return { ...cachedEntry, cached: true };
    }
    if (preferCache && repo.parent && cache[repo.parent]) {
      return {}
    }
    debug(`No cache found for ${repo.url} ${repo.branch}`);
    await Promise.delay(1 * 1000);
    try {
      const url = repo.url;
      const repoName = shortRepoName(url);
      const apiInfo = await getRepositoryInfo(url);
      const languagesInfo = await getLanguages(url);
      const languages = _.keys(languagesInfo).map(function(key) {
        return {
          name: key,
          value: languagesInfo[key],
          color: githubColors[key]
        }
      });
      const contributionsInfo = await getWeeklyContributions(url);
      const contributions = contributionsInfo.all.join(';');
      const firstWeek = new Date();
      firstWeek.setDate(firstWeek.getDate() - firstWeek.getDay() - 51 * 7);
      const stars = apiInfo.stargazers_count || 0;
      let license = (apiInfo.license || {}).name || 'Unknown License';
      if (license === 'NOASSERTION') {
        license = 'Unknown License';
      }

      const description = apiInfo.description;
      const branch = repo.branch || apiInfo.default_branch;

      const releaseDate = await getReleaseDate({repo: repoName});
      const releaseLink = releaseDate && `${url}/releases`;
      const contributorsCount = await getContributorsCount(url);
      const contributorsList = repo.multiple ? await getContributorsList(repoName) : []
      const contributorsLink = `${url}/graphs/contributors`;
      // console.info(contributorsCount, contributorsLink);
      var date;
      var latestCommitLink;
      var latestDateResult = await getRepoLatestDate({repo:repoName, branch: branch });
      // console.info(repo, latestDateResult);
      date = latestDateResult.date;
      latestCommitLink = latestDateResult.commitLink;
      reporter.write(cacheMiss('*'));
      return ({
        url: repo.url,
        languages,
        contributions,
        firstWeek: firstWeek.toISOString().substring(0, 10) + 'Z',
        stars,
        license,
        description,
        latest_commit_date: date,
        latest_commit_link: latestCommitLink,
        release_date: releaseDate,
        release_link: releaseLink,
        contributors_count: contributorsCount,
        contributors_link: contributorsLink,
        contributors_list: contributorsList
      });
    } catch (ex) {
      debug(`Fetch failed for ${repo.url}, attempt to use a cached entry`);
      if (cachedEntry) {
        addWarning('github');
        reporter.write(error('E'));
        errors.push(error(`Using cached entry, and ${repo.url} has issues with stats fetching: ${ex.message.substring(0, 100)}`));
        return cachedEntry;
      } else {
        addError('github');
        reporter.write(fatal('F'));
        errors.push(fatal(`No cached entry, and ${repo.url} has issues with stats fetching: ${ex.message.substring(0, 100)}`));
        setFatalError(`No cached entry, and ${repo.url} has issues with stats fetching: ${ex.message.substring(0, 100)}`);
        return null;
      }
    }
  }, {concurrency: 10});
  reporter.summary();
  _.each(errors, (x) => console.info(x));
  return result;
}
