import _ from 'lodash';
import path from 'path';
import { projectPath } from './settings';
import { dump } from './yaml';

const cleanupFile = function(filename, orderKeys) {
  const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, filename)));
  _.each(source.landscape, function(category) {
    _.each(category.subcategories, function(subcategory) {
      subcategory.items = _.orderBy(subcategory.items, (x) => x.name.toUpperCase());
    });
  });
  if (orderKeys) {
    _.each(source.landscape, function(category) {
      _.each(category.subcategories, function(subcategory) {
        subcategory.items = subcategory.items.map(function(item) {
          return _(item).toPairs().sortBy( (pair) => orderKeys.indexOf(pair[0])).fromPairs().value();
        });
      });
    });
  }
  require('fs').writeFileSync(path.resolve(projectPath, filename), dump(source));
}
const cleanupMembers = function() {
  const filename = 'members.yml';
  const fullFilename = path.resolve(projectPath, filename);
  if (require('fs').existsSync(fullFilename)) {
    const data = require('js-yaml').safeLoad(require('fs').readFileSync(fullFilename));
    const sortedData = _.mapValues(data, (value, key) => _.orderBy(value));
    require('fs').writeFileSync(path.resolve(projectPath, filename), dump(sortedData));
  }
}

const landscapeKeys = [
  'name',
  'description',
  'homepage_url',
  'project',
  'repo_url',
  'branch',
  'url_for_bestpractices',
  'stock_ticker',
  'logo',
  'enduser',
  'twitter',
  'crunchbase'
];
cleanupFile('landscape.yml', landscapeKeys);
cleanupFile('settings.yml');
cleanupMembers();
