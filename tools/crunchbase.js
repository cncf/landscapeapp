const colors = require('colors');
const Promise = require('bluebird');
const _ = require('lodash');
const path = require('path');
const debug = require('debug')('cb');

const { ensureHttps } = require('./ensureHttps');
const { errorsReporter } = require('./reporter');
const { projectPath } = require('./settings');
const { makeReporter } = require('./progressReporter');
const { CrunchbaseClient, YahooFinanceClient } = require('./apiClients');

const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;
const { addError, addFatal } = errorsReporter('crunchbase');

const EXCHANGE_SUFFIXES = {
  'ams': 'AS', // Amsterdam
  'bit': 'MI', // Milan
  'bme': 'MC', // Madrid
  'epa': 'PA', // Paris
  'etr': 'DE', // XETRA
  'fra': 'F',  // Frankfurt
  'hel': 'HE', // Helsinki
  'hkg': 'HK', // Hong Kong
  'krx': 'KS', // South Korea
  'lse': 'L', // London
  'moex': 'ME', // Moscow
  'mcx': 'ME', // Alternate code for Moscow
  'nse': 'NS', // India
  'sse': 'SS', // Shanghai
  'swx': 'SW', // Zurich
  'szse': 'SZ',  // Shenzhen
  'tpe': 'TW', // Taipei
  'tyo': 'T', // Tokyo
  'vie': 'VI', // Viena
}

const getSymbolWithSuffix = (symbol, exchange) => {
  const exchangeSuffix = EXCHANGE_SUFFIXES[exchange]

  return [symbol, exchangeSuffix].filter(_ => _).join('.')
}

const getCrunchbaseOrganizationsList = module.exports.getCrunchbaseOrganizationsList = async function() {
  const traverse = require('traverse');
  const source = require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
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

module.exports.extractSavedCrunchbaseEntries = async function() {
  const traverse = require('traverse');
  let source = [];
  try {
    source =  require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
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

const getCurrencyConversion = async currency => {
  const path = `/v10/finance/quoteSummary/${currency}=X?modules=summaryDetail`
  const response = await YahooFinanceClient.request({ path })
  const { bid, ask } = response.quoteSummary.result[0].summaryDetail
  return (bid.raw + ask.raw) / 2
}

const getYahooFinanceData = async ticker => {
  const path = `/v10/finance/quoteSummary/${ticker}?modules=summaryDetail`
  const response = await YahooFinanceClient.request({ path })
  const { currency, marketCap } = response.quoteSummary.result[0].summaryDetail
  const conversion = currency === 'USD' ? 1 : await getCurrencyConversion(currency)
  return { ...marketCap, raw: Math.round(marketCap.raw / conversion) }
}

const marketCapCache = {};
async function getMarketCap(ticker) {
  debug(`Extracting the ticker from ${ticker}`);
  let quote;
  try {
    quote = marketCapCache[ticker] || await getYahooFinanceData(ticker)
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

const isDelisted = entry => !!_.get(entry, ['cards', 'ipos', '0', 'delisted_on'])

const fetchCrunchbaseOrganization = async id => {
  return await CrunchbaseClient.request({
    path: `entities/organizations/${id}`,
    params:{
      'card_ids': 'headquarters_address,acquiree_acquisitions,parent_organization,ipos',
      'field_ids': 'num_employees_enum,linkedin,twitter,name,website,short_description,funding_total,stock_symbol,stock_exchange_symbol,categories,company_type'
    }
  });
}

const fetchData = module.exports.fetchData = async function(name) {
  const result = await fetchCrunchbaseOrganization(name)
  const mapAcquisitions = function(a) {
    let result1;
    try {
      result1 = {
        date: a.announced_on.value,
        acquiree: a.acquiree_identifier.value,
      }
      if (a.price) {
        result.price = a.price.value_usd
      }
    } catch(ex) {
      return null;
    }
    return result1;
  }
  let acquisitions = result.cards.acquiree_acquisitions.map(mapAcquisitions).filter( (x) => !!x);
  const limit = 100;
  let lastPage = result;
  while (lastPage.cards.acquiree_acquisitions.length === limit) {
     lastPage = await CrunchbaseClient.request({
        path: `entities/organizations/${name}/cards/acquiree_acquisitions`,
        params: {after_id: lastPage.cards.acquiree_acquisitions[limit - 1].identifier.uuid}
      });
      acquisitions = acquisitions.concat(lastPage.cards.acquiree_acquisitions.map(mapAcquisitions));
  }
  acquisitions = _.orderBy(acquisitions, ['date', 'acquiree']);

  let parents = [];
  let lastOrganization = result;
  while (lastOrganization.cards.parent_organization[0]) {
    const parentOrganization = lastOrganization.cards.parent_organization[0].identifier.permalink
    if (parents.map(p => p.identifier.permalink).includes(parentOrganization)) {
      const { permalink } = lastOrganization.properties.identifier
      throw new Error(`Circular dependency detected: ${permalink} and ${parentOrganization} are parents of each other`)
    }
    lastOrganization = await fetchCrunchbaseOrganization(parentOrganization)
    parents.push({ ...lastOrganization.properties, delisted: isDelisted(lastOrganization) })
  }
  const parentLinks = parents.map( (item) => 'https://www.crunchbase.com/organization/' + item.identifier.permalink );

  const firstWithStockSymbol = _.find([{ ...result.properties, delisted: isDelisted(result) }].concat(parents), (x) => !!x.stock_symbol && !x.delisted);
  const stockSymbol = firstWithStockSymbol && getSymbolWithSuffix(firstWithStockSymbol.stock_symbol.value, firstWithStockSymbol.stock_exchange_symbol)
  const firstWithTotalFunding = _.find([result.properties].concat(parents), (x) => !!x.funding_total);
  const totalFunding = firstWithTotalFunding ? + firstWithTotalFunding.funding_total.value_usd.toFixed() : undefined;

  const getAddressPart = function(part) {
    if (!result.cards.headquarters_address[0]) {
      return " N/A";
    }
    return (result.cards.headquarters_address[0].location_identifiers.filter( (x) => x.location_type === part)[0] || {}).value
  }


  const { employeesMin, employeesMax } = (function() {
    const value = result.properties.num_employees_enum || '';
    const parts = value.split('_');
    if (parts.length !== 3) {
      return { employeesMin: null, employeesMax: null}
    } else {
      return { employeesMin: + parts[1], employeesMax: parts[2] === 'max' ? 1000000 : + parts[2] }
    }
  })();

  return {
    name: result.properties.name,
    description: result.properties.short_description,
    num_employees_min: employeesMin,
    num_employees_max: employeesMax,
    homepage: (result.properties.website || {value: null}).value ,
    city: getAddressPart('city'),
    region: getAddressPart('region'),
    country: getAddressPart('country'),
    twitter: result.properties.twitter ? result.properties.twitter.value : null,
    linkedin: result.properties.linkedin ? ensureHttps(result.properties.linkedin.value) : null,
    acquisitions,
    parents: parentLinks,
    ticker: stockSymbol,
    funding: totalFunding,
    stockExchange: result.properties.stock_exchange_symbol || null,
    company_type: _.startCase(result.properties.company_type),
    industries: (result.properties.categories || []).map(category => category.value).sort()
  }
}

module.exports.fetchCrunchbaseEntries = async function({cache, preferCache}) {
  // console.info(organizations);
  // console.info(_.find(organizations, {name: 'foreman'}));
  const reporter = makeReporter();
  const errors = [];
  const fatalErrors = [];
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
      const result = await fetchData(c.name);

      const entry = {
        url: c.crunchbase,
        ...result
      };
      if (_.isEmpty(entry.city)) {
        fatalErrors.push(`No city for a crunchbase entry for ${c.name} at ${c.crunchbase} `);
        reporter.write(fatal("F"));
        return null;
      }

      if (!(c.ticker === null) && (entry.ticker || c.ticker)) {
        // console.info('need to get a ticker?');
        entry.effective_ticker = c.ticker || entry.ticker;
        try {
          entry.market_cap = await getMarketCap(entry.effective_ticker, entry.stockExchange);
          entry.kind = 'market_cap';
        } catch(ex) {
          console.info(`Skipping market cap calculation`);
        }
      } else if (entry.funding) {
        entry.kind = 'funding';
      } else {
      }
      delete entry.stockSymbol;
      reporter.write(cacheMiss("*"));
      return entry;
      // console.info(entry);
    } catch (ex) {
      console.info(ex);
      if (cachedEntry) {
        errors.push(`Using cached entry, because can not fetch: ${c.name} ` +  ex.message.substring(0, 200));
        reporter.write(error("E"));
        return cachedEntry;
      } else {
        // console.info(c.name);
        fatalErrors.push(`No cached entry, and can not fetch: ${c.name}. ` +  ex.message.substring(0, 200));
        reporter.write(fatal("F"));
        return null;
      }
    }
  }, {concurrency: 5})

  reporter.summary();
  _.each(errors, (x) => addError(x));
  _.each(fatalErrors, (x) => addFatal(x));
  return result;
}
