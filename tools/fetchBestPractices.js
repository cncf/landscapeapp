const colors = require('colors');
const Promise = require('bluebird');
const _ = require('lodash');
const path = require('path');
const debug = require('debug')('bestpractices');

const { errorsReporter } = require('./reporter');
const { requestWithRetry } = require('./requestWithRetry');
const { projectPath } = require('./settings');
const { makeReporter } = require('./progressReporter');
const { retry } = require('./retry');

const { addError } = errorsReporter('bestpractices');

const errorColor = colors.red;
const cacheMiss = colors.green;


async function getLandscapeItems() {
  const source = require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const traverse = require('traverse');
  const tree = traverse(source);
  const items = [];
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.item !== null) {
      return;
    }
    if (node.repo_url === null) {
      return;
    }
    items.push({repo_url: node.url_for_bestpractices || node.repo_url});
  });
  return items;
}

async function fetchEntriesNoRetry() {
  const maxNumber = 300;
  const items = await Promise.map(_.range(1, maxNumber), async function(number) {
    const result = await requestWithRetry({
      url: `https://bestpractices.coreinfrastructure.org/en/projects.json?page=${number}`
    });
    return result.map(x => ({
      id: x.id,
      repo_url: x.repo_url,
      percentage: x.badge_percentage_0
    })).filter(x => !!x.repo_url);
  }, {concurrency: 1});
  return _.flatten(items);
}

async function fetchEntryNoRetry(url) {
  let result = await requestWithRetry({
    json: true,
    url: `https://bestpractices.coreinfrastructure.org/en/projects.json?pq=${encodeURIComponent(url)}`
  });
  if (result[0]) {
    result = result[0];
  }
  return {
    id: result.id,
    repo_url: result.repo_url,
    percentage: result.badge_percentage_0
  };
}

async function fetchEntries() {
  return await retry(fetchEntriesNoRetry, 3);
}

async function fetchEntry(url) {
  return await retry(() => fetchEntryNoRetry(url), 3);
}

module.exports.fetchBestPracticeEntriesWithFullScan =  async function({cache, preferCache}) {
  const items = await getLandscapeItems();
  const errors = [];
  var fetchedEntries = null;
  const reporter = makeReporter();
  const result = await Promise.mapSeries(items, async function(item) {
    if (!item.repo_url) {
      return null;
    }
    const cachedEntry = _.find(cache, (c) => c.repo_url.toLowerCase() === item.repo_url.toLowerCase());
    if (cachedEntry && preferCache) {
      debug(`Full scan: Cache found for ${item.repo_url}`);
      reporter.write('.');
      return cachedEntry;
    }
    debug(`Full scan: Cache not found for ${item.repo_url}`);
    try {
      fetchedEntries = fetchedEntries || await fetchEntries();
      let repo_url = item.repo_url;
      let badge = _.find(fetchedEntries, (x) => x.repo_url.toLowerCase() === item.repo_url.toLowerCase());
      if (!badge && item.project_org) {
        repo_url = item.project_org;
        badge = _.find(fetchedEntries, (x) => x.repo_url.toLowerCase() === item.project_org.toLowerCase());
      }
      reporter.write(cacheMiss("*"));
      return ({
        repo_url: repo_url,
        badge: badge ? badge.id : false,
        percentage: badge ? badge.percentage : null
      });
    } catch (ex) {
      debug(`Full scan: Fetch failed for ${item.repo_url}, attempt to use a cached entry`);
      reporter.write(errorColor("E"));
      errors.push(`Cannot fetch: ${item.repo_url} `, ex.message.substring(0, 200));
      return cachedEntry || null;
    }
  });
  reporter.summary();
  _.each(errors, function(e) {
    addError(e);
  });
  return result;
}

module.exports.fetchBestPracticeEntriesWithIndividualUrls = async function({cache, preferCache}) {
  const items = await getLandscapeItems();
  const errors = [];
  const reporter = makeReporter();
  const result = await Promise.mapSeries(items, async function(item) {
    if (!item.repo_url) {
      return null;
    }
    let cachedEntry = _.find(cache, (c) => c.repo_url.toLowerCase() === item.repo_url.toLowerCase());
    if (!cachedEntry && item.project_org) {
      cachedEntry = _.find(cache, (c) => c.repo_url.toLowerCase() === item.project_org.toLowerCase());
    }
    if (cachedEntry && preferCache) {
      reporter.write('.');
      return cachedEntry;
    }
    debug(`Individual scan: Cache not found for ${item.repo_url}`);
    try {
      let repo_url = item.repo_url;
      let badge = await fetchEntry(item.repo_url);
      if (!badge && item.project_org) {
        repo_url = item.project_org;
        badge = await fetchEntry(item.project_org);
      }
      reporter.write(cacheMiss("*"));
      return ({
        repo_url: repo_url,
        badge: badge ? badge.id : false,
        percentage: badge ? badge.percentage : null
      });
    } catch (ex) {
      debug(`Individual scan: Fetch failed for ${item.repo_url}, attempt to use a cached entry`);
      reporter.write(errorColor("E"));
      errors.push(`Cannot fetch: ${item.repo_url} `, ex.message.substring(0, 200));
      return cachedEntry || null;
    }
  });
  reporter.summary();
  _.each(errors, function(error) {
    console.info('error: ', error);
  });
  return result;



}

module.exports.extractSavedBestPracticeEntries =  async function extractSavedBestPracticeEntries() {
  const traverse = require('traverse');
  let source = [];
  try {
    source =  require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
  } catch(_ex) {
    console.info('Cannot extract image entries from the processed_landscape.yml');
  }

  var entries = [];
  const tree = traverse(source);
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.best_practice_data && node.repo_url) {
      entries.push({...node.best_practice_data, repo_url: node.url_for_bestpractices || node.repo_url});
    }
  });

  return _.uniq(entries);
}
