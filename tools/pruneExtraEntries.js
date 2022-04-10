import _ from 'lodash';
import { landscape, saveLandscape } from "./landscape";
import { processedLandscape } from "./processedLandscape";
import { YahooFinanceClient } from "./apiClients";
import errorsReporter from './reporter';
const { addFatal } = errorsReporter('general');

function find({source, categoryName, subcategoryName, itemName}) {
  let result = null;
  _.each(source.landscape, function(category) {
    _.each(category.subcategories, function(subcategory) {
      _.each(subcategory.items, function(item) {
        if (item.name === itemName && subcategory.name === subcategoryName && category.name === categoryName) {
          result = item;
        }
      });
    });
  });
  return result;
}

const cleanupFile = async () => {
  let promises = []
  _.each(landscape.landscape, function(category) {
    _.each(category.subcategories, function(subcategory) {
      _.each(subcategory.items, function(item) {
        const processed = find({source: processedLandscape, categoryName: category.name, subcategoryName: subcategory.name, itemName: item.name});
        if (!processed) {
          addFatal(`FATAL: entry ${item.name} at ${category.name}/${subcategory.name} not found in the processed_landscape.yml`);
          process.exit(1);
        }
        const fn = function(s) {
          if (!s) {
            return '';
          }
          return s.split('/').slice(-1)[0];
        }
        if (item.hasOwnProperty('twitter') && fn((processed.crunchbase_data || {}).twitter) === fn(item.twitter)) {
          console.info(`Deleted ${item.twitter} twitter for ${item.name} because it is available from ${item.crunchbase}`);
          delete item.twitter;
        }
        if (item.hasOwnProperty('stock_ticker') && processed.crunchbase_data) {
          const crunchbaseTicker = processed.crunchbase_data.ticker || null
          if(crunchbaseTicker === item.stock_ticker) {
            console.info(`Deleted ${item.stock_ticker} ticker for ${item.name} because it is available from ${item.crunchbase}`);
            delete item.stock_ticker;
          }
          if(crunchbaseTicker && item.hasOwnProperty('stock_ticker')) {
            const promise = new Promise(resolve => {
              const path = `/v10/finance/quoteSummary/${crunchbaseTicker}?modules=summaryDetail`
              YahooFinanceClient.request({ path }).then((response) => {
                const marketCap = _.get(response, ['quoteSummary', 'result', '0', 'summaryDetail', 'marketCap', 'raw'])
                if (marketCap && marketCap > 0) {
                  delete item.stock_ticker;
                  console.info(`Deleted unnecessary ticker for ${item.name} because the stock exists (${crunchbaseTicker})`);
                }
                resolve()
              }).catch(resolve)
            })
            promises.push(promise)
          }
        }
      });
    });
  });
  await Promise.all(promises)
  saveLandscape(landscape)
}
cleanupFile();
