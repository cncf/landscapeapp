import { setFatalError } from './fatalErrors';
import colors from 'colors';
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
import { CrunchbaseClient, CrunchbaseClientV4 } from './apiClients';

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

async function getParentCompanies(companyInfo, visited = []) {
  var parentInfo = companyInfo.relationships.owned_by.item;
  // console.info(`looking for parent for ${companyInfo.name}`);
  // console.info(`parentInfo is ${parentInfo}`);
  if (!parentInfo) {
    // console.info('returning []');
    return [];
  } else {
    var parentId = parentInfo.uuid;
    const { permalink } = parentInfo.properties;
    if (parentId === companyInfo.uuid) {
      return []; //we are the parent and this hangs up the algorythm
    }
    if (visited.includes(permalink)) {
      throw new Error(`Cyclic dependency detected when fetching parents: ${visited.join(', ')}, ${permalink}`);
    }
    var fullParentInfo = await CrunchbaseClient.request({ path: `/organizations/${parentId}` });
    var cbInfo = fullParentInfo.data;
    return [parentInfo].concat(await getParentCompanies(cbInfo, [...visited, permalink]));
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

const fetchAcquisitions = async(url, params = {}) => {
  const response = await CrunchbaseClient.request({ url, params })
  const { items, paging } = response.data
  const { next_page_url } = paging
  if (!next_page_url) {
    return items
  }
  return items + await fetchAcquisitions(next_page_url)
}

const getAcquisitions = async (acquisitions) => {
  const { items, paging } = acquisitions
  const { total_items, first_page_url } = paging
  const entries = items.length === total_items ? items : await fetchAcquisitions(first_page_url, { items_per_page: 1000 })
  return entries.map(acquisition => {
    const { name } = acquisition.relationships.acquiree.properties
    let result = {
      date: acquisition.properties.announced_on,
      acquiree: name
    }
    if (acquisition.properties.price_usd) {
      result.price = acquisition.properties.price_usd
    }
    return result
  })
}

export async function fetchNewData(name) {
  const result = await CrunchbaseClientV4.request({ path: `entities/organizations/${name}`, params:{'card_ids': 'headquarters_address,acquiree_acquisitions', 'field_ids': 'num_employees_enum,linkedin,twitter,name,website,short_description' }});
  const mapAcquisitions = function(a) {
    const result = {
      date: a.announced_on.value,
      acquiree: a.acquiree_identifier.value,
    }
    if (a.price) {
      result.price = a.price.value_usd
    }
    return result;
  }
  let acquisitions = result.cards.acquiree_acquisitions.map(mapAcquisitions);
  const limit = 100;
  let lastPage = result;
  while (lastPage.cards.acquiree_acquisitions.length === limit) {
     lastPage = await CrunchbaseClientV4.request({
        path: `entities/organizations/${name}/cards/acquiree_acquisitions`,
        params: {after_id: lastPage.cards.acquiree_acquisitions[limit - 1].identifier.uuid}
      });
      acquisitions = acquisitions.concat(lastPage.cards.acquiree_acquisitions.map(mapAcquisitions));
  }
  acquisitions = _.orderBy(acquisitions, ['date', 'acquiree']);
  const getAddressPart = function(part) {
    return (result.cards.headquarters_address[0].location_identifiers.filter( (x) => x.location_type === part)[0] || {}).value
  }
  const employee_parts = (result.properties.num_employees_enum || '').split('_');
  return {
    name: result.properties.name,
    description: result.properties.short_description,
    num_employees_min: +employee_parts[1],
    num_employees_max: employee_parts[2] === 'max' ? 1000000 : +employee_parts[2],
    homepage: (result.properties.website || {}).value,
    city: getAddressPart('city'),
    region: getAddressPart('region'),
    country: getAddressPart('country'),
    twitter: (result.properties.twitter || {}).value,
    linkedin: (result.properties.linkedin || {}).value,
    acquisitions
  }
}

export async function fetchOldData(name) {
      const result = await CrunchbaseClient.request({ path: `/organizations/${name}` });
      var cbInfo = result.data.properties;
      const { relationships } = result.data
      var twitterEntry = _.find(relationships.websites.items, (x) => x.properties.website_name === 'twitter');
      var linkedInEntry = _.find(relationships.websites.items, (x) => x.properties.website_name === 'linkedin');
      const headquarters = relationships.headquarters;
      const acquisitions = _.orderBy(await getAcquisitions(relationships.acquisitions), ['date', 'acquiree']);
      const entry = {
        name: cbInfo.name,
        description: cbInfo.short_description,
        num_employees_min: cbInfo.num_employees_min,
        num_employees_max: cbInfo.num_employees_max,
        homepage: cbInfo.homepage_url,
        city: headquarters && headquarters.item && headquarters.item.properties.city || null,
        region: headquarters && headquarters.item && headquarters.item.properties.region || null,
        country: headquarters && headquarters.item && headquarters.item.properties.country || null,
        twitter: twitterEntry ? twitterEntry.properties.url : null,
        linkedin: linkedInEntry ? ensureHttps(linkedInEntry.properties.url) : null,
        acquisitions
      };
      return entry;
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
      cachedEntry.parents = cachedEntry.parents || [];
      return cachedEntry;
    }
    if (c.unnamed_organization) {
      return {};
    }
    try {
      const result = await CrunchbaseClient.request({ path: `/organizations/${c.name}` });
      var cbInfo = result.data.properties;
      const { relationships } = result.data
      var twitterEntry = _.find(relationships.websites.items, (x) => x.properties.website_name === 'twitter');
      var linkedInEntry = _.find(relationships.websites.items, (x) => x.properties.website_name === 'linkedin');
      const headquarters = relationships.headquarters;
      const acquisitions = await getAcquisitions(relationships.acquisitions)
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
        linkedin: linkedInEntry ? ensureHttps(linkedInEntry.properties.url) : null,
        acquisitions
      };
      if (_.isEmpty(entry.city)) {
        addError('crunchbase');
        debug(`empty city on ${c.name}`);
        setFatalError(`No city for a crunchbase entry for ${c.name} at ${c.crunchbase} `);
        errors.push(fatal(`No city for a crunchbase entry for ${c.name} at ${c.crunchbase} `));
        reporter.write(fatal("F"));
        return null;
      }
      var parents = await getParentCompanies(result.data);
      entry.parents = parents.map( (item) =>  'https://www.crunchbase.com/' + item.properties.web_path);
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
        debug(`normal request failed, so returning a cached entry for ${c.name} ${ex.message.substring(0, 200)}`);
        errors.push(error(`Using cached entry, because can not fetch: ${c.name} ` +  ex.message.substring(0, 200)));
        reporter.write(error("E"));
        return cachedEntry;
      } else {
        // console.info(c.name);
        addError('crunchbase');
        debug(`normal request failed, and no cached entry for ${c.name}`);
        setFatalError(`No cached entry, and can not fetch: ${c.name} ` + ex.message.substring(0, 200));
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
