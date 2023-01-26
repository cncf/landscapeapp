const path = require('path');
const Promise = require('bluebird');
const traverse = require('traverse');
const _ = require('lodash');

const { requestWithRetry } = require('./requestWithRetry');
const { projectPath } = require('./settings');

async function getLandscapeItems() {
  const source = require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const traverse = require('traverse');
  const tree = traverse(source);
  const items = [];
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.item !== null) {
      return;
    }
    if (!node.extra) {
      return;
    }
    if (!node.extra.clomonitor_name) {
      return;
    }
    items.push({clomonitor_name: node.extra.clomonitor_name });
  });
  return items;
}

module.exports.fetchCloEntries = async function() {
  const items = await getLandscapeItems();
  const result = await Promise.mapSeries(items, async function(item) {
    try {
      const svg = await requestWithRetry({
        url: `https://clomonitor.io/api/projects/cncf/${item.clomonitor_name}/report-summary?theme=light`
      });
      return {
        clomonitor_name: item.clomonitor_name,
        svg: svg
      }
    } catch(ex) {
      console.info(`Warning: failed to fetch ${item.clomonitor_name}`);
      return {
        clomonitor_name: item.clomonitor_name,
        svg: ''
      }
    }
  });
  return result;
}
