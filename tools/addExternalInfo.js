const path = require('path');
const traverse = require('traverse');
const _ = require('lodash');

const { checkVersion } = require('./checkVersion');
const { hasFatalErrors, reportFatalErrors } = require('./fatalErrors');
const { errorsReporter } = require('./reporter');
const { projectPath, settings } = require('./settings');
const { actualTwitter } = require('./actualTwitter');
const { extractSavedImageEntries, fetchImageEntries, removeNonReferencedImages } = require('./fetchImages');
const { extractSavedCrunchbaseEntries, fetchCrunchbaseEntries } = require('./crunchbase');
const { fetchGithubEntries } = require('./fetchGithubStats');
const { getProcessedRepos, getProcessedReposStartDates } = require('./repos');
const { fetchStartDateEntries } = require('./fetchGithubStartDate');
const { fetchCloEntries } = require('./fetchCloData');
const { extractSavedTwitterEntries, fetchTwitterEntries } = require('./twitter');
const {
  extractSavedBestPracticeEntries,
  fetchBestPracticeEntriesWithFullScan,
  fetchBestPracticeEntriesWithIndividualUrls
} = require('./fetchBestPractices');
const { shortRepoName } = require('../src/utils/shortRepoName');
const { updateProcessedLandscape } = require("./processedLandscape");
const { landscape } = require('./landscape')
const { addFatal } = errorsReporter('crunchbase');

var useCrunchbaseCache = true;
var useImagesCache = !process.env.IGNORE_IMAGES_CACHE;
var useGithubCache = true;
var useGithubStartDatesCache = true;
var useTwitterCache = true;
var useBestPracticesCache = true;
var key = process.env.LEVEL || 'easy';

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
} else if (key.toLowerCase() === 'crunchbase') {

  useCrunchbaseCache = false;
  reportOptions();
}
else if (key.toLowerCase() === 'medium') {
  useTwitterCache=false;
  useGithubCache=false;
  useCrunchbaseCache=true;
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
  await checkVersion();
  var crunchbaseEntries;
  var savedCrunchbaseEntries;
  if (settings.global.skip_crunchbase) {
    console.info('This project does not fetch crunchbase entries');
    savedCrunchbaseEntries = [];
  } else if (process.env.CRUNCHBASE_KEY_4) {
    console.info('Fetching crunchbase entries');
    savedCrunchbaseEntries = await extractSavedCrunchbaseEntries();
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
  console.info('got image entries');
  const { imageEntries, imageErrors } = await fetchImageEntries({
    cache: savedImageEntries,
    preferCache: useImagesCache
  });
  if (imageErrors.length === 0) {
    removeNonReferencedImages(imageEntries);
  }

  console.info('Fetching last tweet dates');
  const savedTwitterEntries = await extractSavedTwitterEntries();

  // const twitterEntries = await fetchTwitterEntries({
    // cache: savedTwitterEntries,
    // preferCache: useTwitterCache,
    // crunchbaseEntries: crunchbaseEntries
  // });

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
  require('fs').writeFileSync('/tmp/bp.json', JSON.stringify(bestPracticeEntries, null, 4));

  console.info('Fetching CLOMonitor data');
  const cloEntries = await fetchCloEntries();

  const tree = traverse(landscape);
  console.info('Processing the tree');
  const newProcessedLandscape = tree.map(function(node) {
    if (node && node.item === null) {
      //crunchbase
      if (node.organization) {
        node.crunchbase_data = { ...node.organization, parents: [] }
        if (node.crunchbase) {
          addFatal(`the project does not use a crunchbase, but a crunchbase ${node.crunchbase} is present for a ${node.name}`);
        }
      } else if (node.unnamed_organization) {
        node.crunchbase = settings.global.self;
        node.crunchbase_data = _.clone({ ...settings.anonymous_organization, parents: [] });
      } else {
        if (settings.global.skip_crunchbase) {
          addFatal(`organization field is not provided for a ${node.name}. Crunchbase fetching is disabled for this project`);
        } else {
          var crunchbaseInfo = _.clone(_.find(crunchbaseEntries, {url: node.crunchbase}));
          if (crunchbaseInfo) {
            delete crunchbaseInfo.url;
          }
          node.crunchbase_data = crunchbaseInfo;
        }
      }
      //github
      var githubEntry = _.clone(_.find(githubEntries, { url: node.project_org }) ||
                                _.find(githubEntries, { url: node.repo_url }))
      if (githubEntry) {
        node.github_data = githubEntry;
        const mainRepo = _.clone(_.find(githubEntries, { url: node.repo_url }));
        const additionalRepos = [...(node.additional_repos || []), ...(githubEntry.repos || [])]
          .map(node => node && _.find(githubEntries, { url: node.repo_url || node.url }))
          .filter(n => n && node.repo_url !== n.url)
          .sort((a, b) => b.stars - a.stars)
        const repos = [mainRepo, ...additionalRepos].filter( (x) => !!x);

        if ((node.project_org || node.additional_repos) && repos.length > 0 && !githubEntry.cached) {
          node.github_data.contributors_count = aggregateContributors(repos)
          node.github_data.contributions = aggregateContributions(repos)
          node.github_data.stars = repos.reduce((acc, { stars }) => acc + stars, 0)
          node.github_data.languages = aggregateLanguages(repos)

          const { latest_commit_link, latest_commit_date } = getRepoWithLatestCommit(repos)
          node.github_data.latest_commit_link = latest_commit_link
          node.github_data.latest_commit_date = latest_commit_date
          node.github_data.firstWeek = repos[0].firstWeek
          node.github_data.license = node.license || repos[0].license
          node.github_data.contributors_link = repos[0].contributors_link
        }

        node.repos = githubEntry.cached ? githubEntry.repos : repos.map(repo => ({ url: repo.url, stars: repo.stars }))
        delete node.github_data.url;
        delete node.github_data.branch;
        delete node.github_data.contributors_list
        delete node.github_data.cached
        delete node.github_data.repos
      } else if (node.repo_url) {
        node.repos = [node.repo_url, ...(node.additional_repos || []).map(({ repo_url }) => repo_url)].map(url => ({ url }))
      }

      //github start dates
      var dateEntry = _.clone(_.find(startDateEntries, {url: node.project_org || node.repo_url }));
      if (dateEntry) {
        node.github_start_commit_data = dateEntry;
        const mainRepo = _.clone(_.find(startDateEntries, {url: node.repo_url }));
        const repos = [mainRepo, ...(node.additional_repos || []), ...(dateEntry.repos || [])]
                          .filter(_ => _)
                          .map(node => _.find(startDateEntries, {url: node.repo_url || node.url}))
                          .filter( (x) => !!x)

        if (repos.length > 1 && !dateEntry.cached) {
          node.github_start_commit_data = getRepoWithFirstCommit(repos)
        }

        delete node.github_start_commit_data.url;
        delete node.github_start_commit_data.branch;
        delete node.github_start_commit_data.cached;
        delete node.github_start_commit_data.repos;
      }

      delete node.additional_repos

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
      //twitter
      const twitter = actualTwitter(node, node.crunchbase_data);
      const twitterEntry = _.clone(_.find(savedTwitterEntries, {
        url: twitter
      }));
      if (twitterEntry) {
        node.twitter_data = twitterEntry;
        delete twitterEntry.url;
      }

      const cloEntry = _.clone(_.find(cloEntries, { clomonitor_name: node.extra?.clomonitor_name }));
      // svg clomonitor
      if (cloEntry) {
        node.extra.clomonitor_svg = cloEntry.svg
      }
    }
  });

  if (hasFatalErrors()) {
    console.info('Reporting fatal errors');
    await reportFatalErrors();
    process.exit(1);
  }

  await updateProcessedLandscape(processedLandscape => {
    const { twitter_options, updated_at } = processedLandscape
    console.info('saving!');
    return { ...newProcessedLandscape, twitter_options, updated_at }
  })
  process.exit(0);
}
main().catch(function(x) {
  console.info('Reporting exception');
  console.info(x);
  process.exit(1);
});
