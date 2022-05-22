const colors = require('colors');
const Promise = require('bluebird');
const _ = require('lodash');
const path = require('path');
const debug = require('debug')('twitter');

const { projectPath } = require('./settings');
const { actualTwitter } = require('./actualTwitter');
const { errorsReporter } = require('./reporter');
const { makeReporter } = require('./progressReporter');
const { TwitterClient} = require('./apiClients');
const { addError, addFatal } = errorsReporter('twitter');
const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;

async function getLandscapeItems(crunchbaseEntries) {
  const source = require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const traverse = require('traverse');
  const tree = traverse(source);
  const items = [];
  tree.map(function(node) {
    const getTwitter = function() {
      var crunchbaseEntry = _.find(crunchbaseEntries, {url: node.crunchbase});
      return actualTwitter(node, crunchbaseEntry);
    };
    if (!node) {
      return;
    }
    if (node.item !== null) {
      return;
    }
    const twitter = getTwitter();
    if (!twitter) {
      return;
    }
    items.push({twitter: twitter, name: node.name});
  });
  return items;
}

module.exports.extractSavedTwitterEntries = function() {
  const traverse = require('traverse');
  let source = [];
  try {
    source =  require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
  } catch(_ex) {
    console.info('Cannot extract twitter entries from the processed_landscape.yml');
  }

  var items = [];
  const tree = traverse(source);
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.twitter_data) {
      items.push({...node.twitter_data, url: actualTwitter(node, node.crunchbase_data)});
    }
  });

  return _.uniq(items);
}

async function readDate(url) {
  const lastPart = url.split('/').slice(-1)[0];
  const [screenName, extraPart] = lastPart.split('?');
  if (extraPart) {
    throw new Error(`wrong url: ${url}, because of ${extraPart}`);
  }
  const params = {screen_name: screenName};
  const tweets = await TwitterClient.request({ path: '/statuses/user_timeline', params });
  if (tweets.length === 0) {
    return null;
  }
  return new Date(tweets[0].created_at);
}

module.exports.fetchTwitterEntries =  async function({cache, preferCache, crunchbaseEntries}) {
  const items = (await getLandscapeItems(crunchbaseEntries));
  const errors = [];
  const fatalErrors = [];
  const reporter = makeReporter();
  const result = await Promise.map(items, async function(item) {
    const cachedEntry = _.find(cache, {url: item.twitter});
    if (preferCache && cachedEntry && cachedEntry.latest_tweet_date) {
      debug(`Found cached entry for ${item.twitter}`);
      reporter.write('.');
      return cachedEntry;
    }
    debug(`Fetching data for ${item.twitter}`);
    try {
      var url = item.twitter;
      const date = await readDate(url);
      if (date) {
        reporter.write(cacheMiss("*"));
        return {
          latest_tweet_date: date,
          url: url
        };
      } else {
        reporter.write(fatal("F"));
        fatalErrors.push(`Empty twitter for ${item.name}: ${url}`);
        return {
          latest_tweet_date: date,
          url: url
        };
      }
    } catch(ex) {
      debug(`Cannot fetch twitter at ${url} ${ex.message}`);
      if (cachedEntry) {
        reporter.write(error("E"));
        errors.push(`Using cached entry, because ${item.name} has issues with twitter: ${url}, ${(ex.message || ex).substring(0, 100)}`);
        return cachedEntry;
      } else {
        reporter.write(fatal("F"));
        fatalErrors.push(`No cached entry, and ${item.name} has issues with twitter: ${url}, ${(ex.message || ex).substring(0, 100)}`);
        return null;
      }
    }
  }, {concurrency: 5});
  reporter.summary();
  _.each(fatalErrors, (x) => addFatal(x));
  _.each(errors, (x) => addError(x));
  return result;
}
