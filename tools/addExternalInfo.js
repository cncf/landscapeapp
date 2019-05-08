import { hasFatalErrors } from './fatalErrors';
import process from 'process';
import path from 'path';
import { projectPath, settings } from './settings';
const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
const traverse = require('traverse');
const _ = require('lodash');
import actualTwitter from './actualTwitter';
import {dump} from './yaml';
// import formatCity from '../src/utils/formatCity';
import { fetchImageEntries, extractSavedImageEntries, removeNonReferencedImages } from './fetchImages';
import { fetchCrunchbaseEntries, extractSavedCrunchbaseEntries } from './crunchbase';
import { fetchGithubEntries, extractSavedGithubEntries } from './fetchGithubStats';
import { fetchStartDateEntries, extractSavedStartDateEntries } from './fetchGithubStartDate';
import { fetchTwitterEntries, extractSavedTwitterEntries } from './twitter';
import { fetchBestPracticeEntriesWithFullScan, fetchBestPracticeEntriesWithIndividualUrls, extractSavedBestPracticeEntries } from './fetchBestPractices';
import shortRepoName from '../src/utils/shortRepoName';

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

function getMembers() {
  const membershipFile = path.resolve(projectPath, 'members.yml');
  const hasMembershipFile = require('fs').existsSync(membershipFile);
  const membershipCategoryName = settings.global.membership;
  if (hasMembershipFile && membershipCategoryName) {
    console.info(`FATAL: both members.yml and membership category ${membershipCategoryName} (global.membership in settings.yml) are present. Please choose only one source`);
    process.exit(1);
  }
  if (!hasMembershipFile && !membershipCategoryName) {
    console.info(`FATAL: both members.yml and membership category (global.membership in settings.yml) are not present. Please choose only one source`);
    process.exit(1);

  }
  if (hasMembershipFile) {
    console.info('Fetching yaml members');
    const members = require('js-yaml').safeLoad(require('fs').readFileSync());
    return members;
  }
  else {
    console.info(`Fetching members from ${membershipCategoryName} category`);
    const result = {};
    const tree = traverse(source);
    console.info('Processing the tree');
    tree.map(function(node) {
      if (node && node.category === null && node.name === settings.global.membership) {
        node.subcategories.forEach(function(subcategory) {
          result[subcategory.name] = subcategory.items.map( (item) => item.crunchbase);
        });
      }
    });
    return result;
  }
}
const members = getMembers();
console.info('members', members);

async function main() {

  var crunchbaseEntries;
  var savedCrunchbaseEntries = await extractSavedCrunchbaseEntries();
  if (process.env.CRUNCHBASE_KEY) {
    console.info('Fetching crunchbase entries');
    crunchbaseEntries = await fetchCrunchbaseEntries({
      cache: savedCrunchbaseEntries,
      preferCache: useCrunchbaseCache});
  } else {
    console.info('CRUNCHBASE_KEY is not set. Using processed_landscape.yml as a source for crunchbase info');
    crunchbaseEntries = savedCrunchbaseEntries;
  }

  if (!process.env.TWITTER_KEYS) {
    console.info('TWITTER_KEYS not provided. We will not be able to fetch latest tweet dates');
  }

  if (!process.env.GITHUB_KEY) {
    console.info('GITHUB_KEY is not provided. github api will be rate limited');
  }

  console.info('Fetching github entries');
  const savedGithubEntries = await extractSavedGithubEntries();
  const githubEntries = await fetchGithubEntries({
    cache: savedGithubEntries,
    preferCache: useGithubCache
  });

  console.info('Fetching start date entries');
  const savedStartDateEntries = await extractSavedStartDateEntries();
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
    process.exit(1);
  }


  console.info('Fetching best practices');
  const savedBestPracticeEntries = await extractSavedBestPracticeEntries();
  const fetchBestPracticeEntries = useBestPracticesCache ? fetchBestPracticeEntriesWithIndividualUrls : fetchBestPracticeEntriesWithFullScan;
  const bestPracticeEntries = await fetchBestPracticeEntries({
    cache: savedBestPracticeEntries,
    preferCache: useBestPracticesCache
  });

  const tree = traverse(source);
  console.info('Processing the tree');
  const newSource = tree.map(function(node) {
    if (node && node.item === null) {
      //crunchbase
      var crunchbaseInfo = _.clone(_.find(crunchbaseEntries, {url: node.crunchbase}));
      if (crunchbaseInfo) {
        delete crunchbaseInfo.url;
      }
      node.crunchbase_data = crunchbaseInfo;
      //github
      var githubEntry = _.clone(_.find(githubEntries, {url: node.repo_url}));
      if (githubEntry) {
        node.github_data = githubEntry;
        delete node.github_data.url;
        delete node.github_data.branch;
      }
      //github start dates
      var dateEntry = _.clone(_.find(startDateEntries, {url: node.repo_url}));
      if (dateEntry) {
        node.github_start_commit_data = dateEntry;
        delete node.github_start_commit_data.url;
        delete node.github_start_commit_data.branch;
      }
      //membership
      const membership = _.findKey(members, (v) => v && v.indexOf(node.crunchbase) !== -1);
      node.membership_data = {
        member: membership || false
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

  newSource.twitter_options = require('js-yaml').safeLoad(require('fs').readFileSync(require('path').resolve(projectPath, 'processed_landscape.yml'))).twitter_options;

  const newContent = "# THIS FILE IS GENERATED AUTOMATICALLY!\n" + dump(newSource);
  require('fs').writeFileSync(path.resolve(projectPath, 'processed_landscape.yml'), newContent);
}
main().catch(function(x) {
  console.info(x);
  process.exit(1);
});
