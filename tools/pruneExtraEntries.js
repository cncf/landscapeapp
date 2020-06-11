import _ from 'lodash';
import { landscape, saveLandscape } from "./landscape";
import { processedLandscape } from "./processedLandscape";

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

const cleanupFile = function() {
  _.each(landscape.landscape, function(category) {
    _.each(category.subcategories, function(subcategory) {
      _.each(subcategory.items, function(item) {
        const processed = find({source: processedLandscape, categoryName: category.name, subcategoryName: subcategory.name, itemName: item.name});
        if (!processed) {
          console.info(`FATAL: entry ${item.name} at ${category.name}/${subcategory.name} not found in the processed_landscape.yml`);
          process.exit(1);
        }
        const fn = function(s) {
          if (!s) {
            return '';
          }
          return s.split('/').slice(-1)[0];
        }
        if (item.hasOwnProperty('twitter') && fn(processed.crunchbase_data.twitter) === fn(item.twitter)) {
          console.info(`Deleted ${item.twitter} twitter for ${item.name} because it is available from ${item.crunchbase}`);
          delete item.twitter;
        }
        if (item.hasOwnProperty('stock_ticker') && (processed.crunchbase_data.ticker || null) === item.stock_ticker) {
          console.info(`Deleted ${item.stock_ticker} ticker for ${item.name} because it is available from ${item.crunchbase}`);
          delete item.stock_ticker;
        }
      });
    });
  });
  saveLandscape(landscape)
}
cleanupFile();
