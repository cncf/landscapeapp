import { setFatalError } from './fatalErrors';
import colors from 'colors';
import process from 'process'
import rp from './rpRetry'
import Promise from 'bluebird'
import _ from 'lodash';
import ensureHttps from './ensureHttps';
import { addError, addWarning } from './reporter';
import { projectPath } from './settings';
import path from 'path';
import makeReporter from './progressReporter';
const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;
const debug = require('debug')('cb');
const key = process.env.CRUNCHBASE_KEY;
if (!key) {
  console.info('key not provided');
}

export async function getCrunchbaseOrganizationsList() {
  const traverse = require('traverse');
  const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
  var organizations = [];
  const tree = traverse(source);
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.item !== null) {
      return;
    }
    if (!node.crunchbase) {
      return;
    }
    organizations.push({
      name: node.crunchbase.split('/').slice(-1)[0],
      crunchbase: node.crunchbase,
      ticker: node.stock_ticker
    });
  });
  return _.orderBy(_.uniq(organizations), 'name');
}

export async function extractSavedCrunchbaseEntries() {
  const traverse = require('traverse');
  let source = [];
  try {
    source =  require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
  } catch(_ex) {
    console.info(_ex.message.substring(0,100));
    console.info('Can not extract crunchbase entries from the processed_landscape.yml');
  }

  var organizations = [];
  const tree = traverse(source);
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.crunchbase && node.crunchbase_data) {
      organizations.push({...node.crunchbase_data, ...node.yahoo_finance_data, url: node.crunchbase});
    }
  });

  return _.uniq(organizations);
}

async function getParentCompanies(companyInfo) {
  var parentInfo = companyInfo.relationships.owned_by.item;
  // console.info(`looking for parent for ${companyInfo.name}`);
  // console.info(`parentInfo is ${parentInfo}`);
  if (!parentInfo) {
    // console.info('returning []');
    return [];
  } else {
    var parentId = parentInfo.uuid;
    if (parentId === companyInfo.uuid) {
      return []; //we are the parent and this hangs up the algorythm
    }
    var fullParentInfo =  await rp({
      method: 'GET',
      maxRedirects: 5,
      followRedirect: true,
      uri: `https://api.crunchbase.com/v3.1/organizations/${parentId}?user_key=${key}`,
      timeout: 10 * 1000,
      json: true
    });
    var cbInfo = fullParentInfo.data;
    await Promise.delay(1 * 1000);
    return [parentInfo].concat(await getParentCompanies(cbInfo));
  }
}
const marketCapCache = {};
async function getMarketCap(ticker) {
  // console.info(ticker, stock_exchange);
  // console.info('ticker is', ticker);
  debug(`Extracting the ticker from ${ticker}`);
  var quote;
  try {
    quote = marketCapCache[ticker];
    if (!quote) {
      const response = (await rp({
        url: `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail`,
        json: true
      }));
      quote = response.quoteSummary.result[0].summaryDetail.marketCap;
    }
  } catch(ex) {
    throw new Error(`Can't resolve stock ticker ${ticker}; please manually add a "stock_ticker" key to landscape.yml or set to null`);
  }
  marketCapCache[ticker] = quote;
  const marketCap = quote;
  const result = marketCap.raw || marketCap;
  if (!_.isNumber(result)) {
    throw new Error(`can not fetch market cap from a ticker ${ticker}: ` + JSON.stringify(marketCap) + ' is not a number!');
  }
  return result;
}

export async function fetchCrunchbaseEntries({cache, preferCache}) {
  // console.info(organizations);
  // console.info(_.find(organizations, {name: 'foreman'}));
  const reporter = makeReporter();
  const errors = [];
  const organizations = await getCrunchbaseOrganizationsList();
  const result = await Promise.map(organizations,async function(c) {
    const cachedEntry = _.find(cache, {url: c.crunchbase});
    if (cachedEntry && preferCache) {
      debug(`returning a cached entry for ${cachedEntry.url}`);
      reporter.write(".");
      return cachedEntry;
    }
    await Promise.delay(1 * 1000);
    if (c.crunchbase === 'https://www.cncf.io') {
      const entry = {
        url: c.crunchbase,
        name: 'Non-Public Unnamed Organization',
        description: '',
        homepage: 'https://www.cncf.io',
        city: 'Bouvet Island, Antarctica',
        region: 'Antarctica',
        country: 'Antarctica',
        twitter: 'https://twitter.com/CloudNativeFdn',
        linkedin: null
      }
      return entry;
    }
    try {
      const result = await rp({
        method: 'GET',
        maxRedirects: 5,
        followRedirect: true,
        uri: `https://api.crunchbase.com/v3.1/organizations/${c.name}?user_key=${key}`,
        timeout: 10 * 1000,
        json: true
      });
      var cbInfo = result.data.properties;
      var twitterEntry = _.find(result.data.relationships.websites.items, (x) => x.properties.website_name === 'twitter');
      var linkedInEntry = _.find(result.data.relationships.websites.items, (x) => x.properties.website_name === 'linkedin');
      const headquarters = result.data.relationships.headquarters;
      const entry = {
        url: c.crunchbase,
        name: cbInfo.name,
        description: cbInfo.short_description,
        num_employees_min: cbInfo.num_employees_min,
        num_employees_max: cbInfo.num_employees_max,
        homepage: cbInfo.homepage_url,
        city: headquarters && headquarters.item && headquarters.item.properties.city || null,
        region: headquarters && headquarters.item && headquarters.item.properties.region || null,
        country: headquarters && headquarters.item && headquarters.item.properties.country || null,
        twitter: twitterEntry ? twitterEntry.properties.url : null,
        linkedin: linkedInEntry ? ensureHttps(linkedInEntry.properties.url) : null
      };
      if (_.isEmpty(entry.city)) {
        addError('crunchbase');
        debug(`empty city on ${c.name}`);
        setFatalError();
        errors.push(fatal(`No city for a crunchbase entry for ${c.name} at ${c.crunchbase} `));
        reporter.write(fatal("F"));
        return null;
      }
      var parents = await getParentCompanies(result.data);
       // console.info(parents.map( (x) => x.properties.name));
      var meAndParents = [result.data].concat(parents);
      var firstWithTicker = _.find( meAndParents, (org) => !!org.properties.stock_symbol );
      var firstWithFunding = _.find( meAndParents, (org) => !!org.properties.total_funding_usd );
      if (!(c.ticker === null) && (firstWithTicker || c.ticker)) {
        // console.info('need to get a ticker?');
        entry.ticker = firstWithTicker ? firstWithTicker.properties.stock_symbol : undefined;
        entry.effective_ticker = c.ticker || entry.ticker;
        entry.market_cap = await getMarketCap(entry.effective_ticker, cbInfo.stock_exchange);
        entry.kind = 'market_cap';
        // console.info(cbInfo.name, 'ticker: ', entry.ticker, ' market cap: ', entry.funding);
      } else if (firstWithFunding) {
        entry.kind = 'funding';
        entry.funding = firstWithFunding.properties.total_funding_usd;
        // console.info(cbInfo.name, 'funding: ', entry.funding);
      } else {
        // console.info(cbInfo.name, 'no finance info');
      }
      reporter.write(cacheMiss("*"));
      return entry;
      // console.info(entry);
    } catch (ex) {
      if (cachedEntry) {
        addWarning('crunchbase');
        debug(`normal request failed, so returning a cached entry for ${c.name}`);
        errors.push(error(`Using cached entry, because can not fetch: ${c.name} ` +  ex.message.substring(0, 200)));
        reporter.write(error("E"));
        return cachedEntry;
      } else {
        // console.info(c.name);
        addError('crunchbase');
        debug(`normal request failed, and no cached entry for ${c.name}`);
        setFatalError();
        errors.push(fatal(`No cached entry, and can not fetch: ${c.name} ` +  ex.message.substring(0, 200)));
        reporter.write(fatal("F"));
        return null;
      }
    }
  }, {concurrency: 5})

  reporter.summary();
  _.each(errors, (x) => console.info(x));
  return result;
}
