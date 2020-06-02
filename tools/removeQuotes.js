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

const landscapeKeys = [
  'name',
  'description',
  'homepage_url',
  'project',
  'repo_url',
  'branch',
  'url_for_bestpractices',
  'additional_repos',
  'stock_ticker',
  'logo',
  'enduser',
  'open_source',
  'twitter',
  'crunchbase',
  'allow_duplicate_repo'
];
cleanupFile('landscape.yml', landscapeKeys);
cleanupFile('settings.yml');
