import { hasFatalErrors, reportFatalErrors } from './fatalErrors';
import process from 'process';
import path from 'path';
import { projectPath, settings } from './settings';
import actualTwitter from './actualTwitter';
import { extractSavedImageEntries, fetchImageEntries, removeNonReferencedImages } from './fetchImages';
import { extractSavedCrunchbaseEntries, fetchCrunchbaseEntries } from './crunchbase';
import { fetchGithubEntries } from './fetchGithubStats';
import { getProcessedRepos, getProcessedReposStartDates } from './repos';
import { fetchStartDateEntries } from './fetchGithubStartDate';
import { extractSavedTwitterEntries, fetchTwitterEntries } from './twitter';
import {
  extractSavedBestPracticeEntries,
  fetchBestPracticeEntriesWithFullScan,
  fetchBestPracticeEntriesWithIndividualUrls
} from './fetchBestPractices';
import shortRepoName from '../src/utils/shortRepoName';
import { updateProcessedLandscape } from "./processedLandscape";

const { landscape } = require('./landscape')
const traverse = require('traverse');
const _ = require('lodash');

var useCrunchbaseCache = true;
var useImagesCache=true;
var useGithubCache=true;
var useGithubStartDatesCache=true;
var useTwitterCache = true;
var useBestPracticesCache = true;
var key = require('process').env.LEVEL || 'easy';
function reportOptions() {
  console.info(`Running with a level=${key}. Settings:
     Use cached crunchbase data: ${useCrunchbaseCache}
     Use cached images data: ${useImagesCache}
     Use cached twitter data: ${useTwitterCache}
     Use cached github basic stats: ${useGithubCache}
     Use cached github start dates: ${useGithubStartDatesCache}
     Use cached best practices: ${useBestPracticesCache}
    `);
}
if (key.toLowerCase() === 'easy') {
  reportOptions();
}
else if (key.toLowerCase() === 'medium') {
  useTwitterCache=false;
  useGithubCache=false;
  useCrunchbaseCache=false;
  useBestPracticesCache=false;
  reportOptions();
}
else if (key.toLowerCase() === 'hard') {
  useTwitterCache=false;
  useCrunchbaseCache = false;
  useGithubCache=false;
  useGithubStartDatesCache=false;
  useBestPracticesCache=false;
  reportOptions();
}
else if (key.toLowerCase() === 'complete') {
  useTwitterCache=false;
  useCrunchbaseCache = false;
  useImagesCache=false;
  useGithubCache=false;
  useGithubStartDatesCache=false;
  useBestPracticesCache=false;
  try {
    require('fs').unlinkSync(path.resolve(projectPath, 'processed_landscape.yml'));
  } catch (_ex) { //eslint-disable no-empty

  }
  reportOptions();
} else {
  console.info('Unknown level. Should be one of easy, medium, hard or complete');
}

const aggregateContributors = repos => {
  return (new Set(repos.flatMap(repo => repo.contributors_list))).size
}

const aggregateContributions = repos => {
  const contributions = repos.map(repo => repo.contributions.split(';').map(count => parseInt(count)))

  const totalContributions = contributions.reduce((acc, contributions) => {
    contributions.forEach((count, index) => acc[index] += count)
    return acc
  })

  return totalContributions.join(';')
}

const getRepoWithLatestCommit = repos => {
  return repos.sort((a, b) => new Date(b.latest_commit_link) - new Date(a.latest_commit_link))[0]
}

const getRepoWithFirstCommit = repos => {
  return repos.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0]
}

const aggregateLanguages = repos => {
  const languages = repos.flatMap(repo => repo.languages)

  const aggregate = languages.reduce((acc, language) =>{
    acc[language.name] = acc[language.name] || { ...language, value: 0 }
    acc[language.name].value += language.value
    return acc
  }, {})

  return Object.values(aggregate).sort((a, b) => b.value - a.value)
}

async function main() {

  var crunchbaseEntries;
  var savedCrunchbaseEntries = await extractSavedCrunchbaseEntries();
  if (process.env.CRUNCHBASE_KEY_4) {
    console.info('Fetching crunchbase entries');
    crunchbaseEntries = await fetchCrunchbaseEntries({
      cache: savedCrunchbaseEntries,
      preferCache: useCrunchbaseCache});
  } else {
    console.info('CRUNCHBASE_KEY_4 is not set. Using processed_landscape.yml as a source for crunchbase info');
    crunchbaseEntries = savedCrunchbaseEntries;
  }

  if (!process.env.TWITTER_KEYS) {
    console.info('TWITTER_KEYS not provided. We will not be able to fetch latest tweet dates');
  }

  if (!process.env.GITHUB_KEY) {
    console.info('GITHUB_KEY is not provided. github api will be rate limited');
  }

  console.info('Fetching github entries');
  const savedGithubEntries = getProcessedRepos();
  const githubEntries = await fetchGithubEntries({
    cache: savedGithubEntries,
    preferCache: useGithubCache
  });

  console.info('Fetching start date entries');
  const savedStartDateEntries = await getProcessedReposStartDates();
  const startDateEntries = await fetchStartDateEntries({
    cache: savedStartDateEntries,
    preferCache: useGithubStartDatesCache
  });

  console.info('Fetching images');
  const savedImageEntries = await extractSavedImageEntries();
  const { imageEntries, imageErrors } = await fetchImageEntries({
    cache: savedImageEntries,
    preferCache: useImagesCache
  });
  if (imageErrors.length === 0) {
    removeNonReferencedImages(imageEntries);
  }

  console.info('Fetching last tweet dates');
  const savedTwitterEntries = await extractSavedTwitterEntries();
  const twitterEntries = await fetchTwitterEntries({
    cache: savedTwitterEntries,
    preferCache: useTwitterCache,
    crunchbaseEntries: crunchbaseEntries
  });

  if (hasFatalErrors()) {
    console.info('Reporting fatal errors');
    await reportFatalErrors();
    process.exit(1);
  }


  console.info('Fetching best practices');
  const savedBestPracticeEntries = await extractSavedBestPracticeEntries();
  const fetchBestPracticeEntries = useBestPracticesCache ? fetchBestPracticeEntriesWithIndividualUrls : fetchBestPracticeEntriesWithFullScan;
  const bestPracticeEntries = await fetchBestPracticeEntries({
    cache: savedBestPracticeEntries,
    preferCache: useBestPracticesCache
  });

  const tree = traverse(landscape);
  console.info('Processing the tree');
  const newProcessedLandscape = tree.map(function(node) {
    if (node && node.item === null) {
      //crunchbase
      if (node.unnamed_organization) {
        node.crunchbase = settings.global.self;
        node.crunchbase_data = _.clone({ ...settings.anonymous_organization, parents: [] });
      } else {
        var crunchbaseInfo = _.clone(_.find(crunchbaseEntries, {url: node.crunchbase}));
        if (crunchbaseInfo) {
          delete crunchbaseInfo.url;
        }
        node.crunchbase_data = crunchbaseInfo;
      }
      //github
      var githubEntry = _.clone(_.find(githubEntries, {url: node.repo_url}));
      if (githubEntry) {
        node.github_data = githubEntry;
        if (node.additional_repos && !githubEntry.cached) {
          const additionalReposEntries = node.additional_repos.map(node => _.find(githubEntries, {url: node.repo_url}))
          const allRepos = [githubEntry, ...additionalReposEntries]
          node.github_data.contributors_count = aggregateContributors(allRepos)
          node.github_data.contributions = aggregateContributions(allRepos)
          node.github_data.stars = [githubEntry.stars, ...additionalReposEntries.map(({ stars }) => stars)].reduce((a, s) => a + s)
          node.github_data.languages = aggregateLanguages(allRepos)

          const { latest_commit_link, latest_commit_date } = getRepoWithLatestCommit(allRepos)
          node.github_data.latest_commit_link = latest_commit_link
          node.github_data.latest_commit_date = latest_commit_date
        }
        delete node.github_data.url;
        delete node.github_data.branch;
        delete node.github_data.contributors_list
        delete node.github_data.cached
      }
      //github start dates
      var dateEntry = _.clone(_.find(startDateEntries, {url: node.repo_url}));
      if (dateEntry) {
        node.github_start_commit_data = dateEntry;

        if (node.additional_repos && !dateEntry.cached) {
          const additionalReposEntries = node.additional_repos.map(node => _.find(startDateEntries, {url: node.repo_url}))
          const allRepos = [dateEntry, ...additionalReposEntries]
          const firstCommit = getRepoWithFirstCommit(allRepos)
          node.github_start_commit_data = firstCommit
        }

        delete node.github_start_commit_data.url;
        delete node.github_start_commit_data.branch;
        delete node.github_start_commit_data.cached;
      }
      //yahoo finance. we will just extract it
      if (node.crunchbase_data && node.crunchbase_data.effective_ticker) {
        node.yahoo_finance_data = {
          market_cap: node.crunchbase_data.market_cap,
          effective_ticker: node.crunchbase_data.effective_ticker
        }
        delete node.crunchbase_data.market_cap,
        delete node.crunchbase_data.effective_ticker
      }
      // images
      const imageEntry = _.clone(_.find(imageEntries, {
        logo: node.logo,
        name: node.name
      }));
      if (imageEntry) {
        node.image_data = imageEntry;
        delete node.image_data.logo;
        delete node.image_data.name;
      }
      // best practicies
      let bestPracticeEntry = _.clone(_.find(bestPracticeEntries, function(x) {
        if (!x) {
          return false;
        }
        if (node.url_for_bestpractices) {
          return x.repo_url === node.url_for_bestpractices;
        }
        const shortName = shortRepoName(x.repo_url);
        if (shortName) {
          return shortName === shortRepoName(node.repo_url);
        }
        return false;
      }));
      if (!bestPracticeEntry || _.isEmpty(bestPracticeEntry) || (_.isUndefined(bestPracticeEntry.badge) && _.isUndefined(bestPracticeEntry.percentage))) {
        bestPracticeEntry = {
          repo_url: node.url_for_bestpractices || node.repo_url,
          badge: false,
          percentage: null
        };
      }
      node.best_practice_data = bestPracticeEntry;
      delete node.best_practice_data.repo_url;
      // twitter
      const twitter = actualTwitter(node, node.crunchbase_data);

      const twitterEntry = _.clone(_.find(twitterEntries, {
        url: twitter
      }));
      if (twitterEntry) {
        node.twitter_data = twitterEntry;
        delete twitterEntry.url;
      }

    }
  });

  updateProcessedLandscape(processedLandscape => {
    const { twitter_options, updated_at } = processedLandscape

    console.info('saving!');
    return { ...newProcessedLandscape, twitter_options, updated_at }
  })
}
main().catch(function(x) {
  console.info('Reporting exception');
  console.info(x);
  process.exit(1);
});
