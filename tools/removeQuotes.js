import _ from 'lodash';
import path from 'path';
import { projectPath } from './settings';

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
  var dump = require('js-yaml').dump(source, {lineWidth: 160});
  dump = dump.replace(/(- \w+:) null/g, '$1');
  require('fs').writeFileSync(path.resolve(projectPath, filename), dump);
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
  'twitter',
  'crunchbase'
];
cleanupFile('landscape.yml', landscapeKeys);
cleanupFile('settings.yml');
