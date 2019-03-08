import process from 'process';
import path from 'path';
import { projectPath } from './settings';
const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath,'landscape.yml')));
const traverse = require('traverse');
const _ = require('lodash');

console.info('Processing the tree');
const errors = [];

const allowedKeys = [
  'name',
  'homepage_url',
  'logo',
  'twitter',
  'crunchbase',
  'repo_url',
  'stock_ticker',
  'description',
  'branch',
  'project',
  'url_for_bestpractices'
];

const categoryKeys = [
  'name',
  'subcategores'
];

function checkItem(item) {
  if (item.item !== null) {
    errors.push(`item ${item.name} does not have a "- item:" part `);
  }
  if (!item.name) {
    errors.push(`item does not have a name`);
  }
  const keys = _.without(_.keys(item), 'item');

  const wrongKeys = keys.filter( function(key) {
    return allowedKeys.indexOf(key) === -1
  });
  wrongKeys.forEach(function(key) {
    errors.push(`entry ${item.name} has an unkown key: ${key}`);
  });


}

function checkCategoryEntry(item) {
  if (item.category !== null) {
    errors.push(`category ${item.name} does not have a "- category:" part `);
  }
  if (!item.name) {
    errors.push(`category does not have a name`);
  }
  const keys = _.keys(item);
  const wrongKeys = keys.filter( function(key) {
    return ['category', 'name', 'subcategories'].indexOf(key) === -1;
  });
  wrongKeys.forEach(function(key) {
    errors.push(`category entry ${item.name} has an unkown key: ${key}`);
  });
}

function checkSubcategoryEntry(item) {
  if (item.subcategory !== null) {
    errors.push(`subcategory ${item.name} does not have a "- subcategory:" part `);
  }
  if (!item.name) {
    errors.push(`subcategory entry does not have a name`);
  }
  const keys = _.keys(item);
  const wrongKeys = keys.filter( function(key) {
    return ['subcategory', 'name', 'items'].indexOf(key) === -1;
  });
  wrongKeys.forEach(function(key) {
    errors.push(`subcategory entry ${item.name} has an unkown key: ${key}`);
  });
}

// ensure that second-level elements are fine
const rootElement = source.landscape;
_.each(rootElement, function(category) {
  checkCategoryEntry(category);
  _.each(category.subcategories, function(subcategory) {
    checkSubcategoryEntry(subcategory);
    _.each(subcategory.items, function(item) {
      checkItem(item);
    });
  });
});




errors.forEach(function(error) {
  console.info('FATAL: ', error);
});
if (errors.length > 0) {
  console.info('Valid item keys are', JSON.stringify(allowedKeys));
  process.exit(1);
}
