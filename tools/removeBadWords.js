import _ from 'lodash';
import path from 'path';
import { projectPath } from './settings';
import { dump } from './yaml';
const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
const section = process.argv[2];
const key = process.argv[3];
console.info(`We will remove a ${key} in a ${section} of each item of processed_landscape.yml`);
_.each(source.landscape, function(category) {
  _.each(category.subcategories, function(subcategory) {
    _.each(subcategory.items, function(item) {
      if (item[section] && item[section][key]) {
        delete item[section][key];
        console.info(`Deleted ${key} in ${section} of ${item.name}`);
      }
    });
  });
});
require('fs').writeFileSync(path.resolve(projectPath, 'processed_landscape.yml'), dump(source));
