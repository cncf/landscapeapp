const colors = require('colors');
const Promise = require('bluebird');
const _ = require('lodash');
const { parse } = require('querystring');
const debug = require('debug')('github');

const { errorsReporter } = require('./reporter');
const { makeReporter } = require('./progressReporter');
const { shortRepoName } = require('../src/utils/shortRepoName');
const { getRepositoryInfo , getLanguages, getWeeklyContributions} = require('./getRepositoryInfo');
const { cacheKey, fetchGithubOrgs, getRepos } = require('./repos');
const { GithubClient} = require('./apiClients');

const { addError, addFatal } = errorsReporter('github');
const { getRepoLatestDate, getReleaseDate } = require('./githubDates');

const githubColors = JSON.parse(require('fs').readFileSync('tools/githubColors.json', 'utf-8'));

const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;

const getContributorsCount = async repo => {
  const per_page = 100
  const path = `/repos/${repo}/contributors`
  const request = ({ page = 1 } = {}) => GithubClient.request({ path, params: { page, per_page, anon: 1 }, resolveWithFullResponse: true })
  const { data, headers } = await request()

  let totalPages, lastPageContributors

  if (headers.link) {
    const lastPageUrl = headers.link.split(',').find(s => s.indexOf('last') > -1).split(';')[0].replace(/[<>]/g, '')
    totalPages = parseInt(parse(lastPageUrl.split('?')[1]).page)
    lastPageContributors = (await request({ page: totalPages })).data
  } else {
    totalPages = 1
    lastPageContributors = data
  }

  return (totalPages - 1) * per_page + lastPageContributors.length
};

const getContributorsList = async (repo, page = 1) => {
  const per_page = 100 // maximum allowed by Github
  const response = await GithubClient.request({ path: `/repos/${repo}/contributors`, params: { page, per_page }})
  const contributors = response.map(contributor => contributor.login)

  return contributors.concat(contributors.length === per_page ? await getContributorsList(repo, page + 1) : [])
}

module.exports.fetchGithubEntries = async function({cache, preferCache}) {
  const errors = [];
  const fatalErrors = [];
  const githubOrgs = (await fetchGithubOrgs(preferCache))
    .map(org => ({ ...org.data, ...org.github_data }))

  githubOrgs.forEach(org => {
    if (org.repos.length === 0) {
      fatalErrors.push(`Organization ${org.url} does not have any repos or all repos are empty`)
    }
  })

  const repos = [...getRepos(), ...githubOrgs.filter(org => !org.cached).map(org => org.repos).flat()]
  debug(cache);
  const reporter = makeReporter();
  const result = await Promise.map(repos, async function(repo) {
    const cachedEntry = cache[cacheKey(repo.url, repo.branch)]
    if (cachedEntry && preferCache) {
      debug(`Cache ${cachedEntry} found for ${repo.url}`);
      reporter.write('.');
      return { ...cachedEntry, cached: true };
    }
    if (repo.url.indexOf('https://github.com') === -1 || (preferCache && repo.parent && cache[repo.parent])) {
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
      const contributorsCount = await getContributorsCount(repoName);
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
        reporter.write(error('E'));
        errors.push(`Using cached entry, and ${repo.url} has issues with stats fetching: ${ex.message.substring(0, 100)}`);
        return cachedEntry;
      } else {
        reporter.write(fatal('F'));
        fatalErrors.push(`No cached entry, and ${repo.url} has issues with stats fetching: ${ex.message.substring(0, 100)}`);
        return null;
      }
    }
  }, {concurrency: 10});
  reporter.summary();
  _.each(errors, (x) => addError(x));
  _.each(fatalErrors, (x) => addFatal(x));
  return [...result, ...githubOrgs]
}
