import _ from 'lodash';
import path from 'path';
import { projectPath } from './settings';
import { dump } from './yaml';

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
  const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const processedSource = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));

  _.each(source.landscape, function(category) {
    _.each(category.subcategories, function(subcategory) {
      _.each(subcategory.items, function(item) {
        const processed = find({source: processedSource, categoryName: category.name, subcategoryName: subcategory.name, itemName: item.name});
        if (!processed) {
          console.info(`FATAL: entry ${item.name} at ${category.name}/${subcategory.name} not found in the processed_landscape.yml`);
          process.exit(1);
        }
        if (item.twitter && processed.crunchbase_data.twitter === item.twitter) {
          console.info(`No need to have a twitter ${item.twitter} for ${item.name} because it is available at ${item.crunchbase} page`);
          delete item.twitter;
        }
        if (item.stock_ticker && processed.crunchbase_data.ticker === item.stock_ticker) {
          console.info(`No need to have a stock_ticker ${item.stock_ticker} for ${item.name} because it is available at ${item.crunchbase} page`);
          delete item.stock_ticker;
        }
      });
    });
  });
  require('fs').writeFileSync(path.resolve(projectPath, 'landscape.yml'), dump(source));
}
cleanupFile();
