import _ from 'lodash';
import path from 'path';
import { projectPath } from './settings';
const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
_.each(source.landscape, function(category) {
  _.each(category.subcategories, function(subcategory) {
    subcategory.items = _.orderBy(subcategory.items, (x) => x.name.toUpperCase());
  });
});
var dump = require('js-yaml').dump(source, {lineWidth: 160});
dump = dump.replace(/(- \w+:) null/g, '$1');
require('fs').writeFileSync(path.resolve('landscape.yml', projectPath), dump);
