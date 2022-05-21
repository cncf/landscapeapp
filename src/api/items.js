const fs = require('fs');
const path = require('path');

const { flattenItems } = require('../utils/itemsCalculator');
const { getGroupedItems }  = require('../utils/itemsCalculator');
const { getSummary, getSummaryText } = require('../utils/summaryCalculator');
const { parseParams } = require('../utils/routing');
const { readJsonFromDist } = require('../utils/readJson');

const items = readJsonFromDist('dist/data/items');
const settings = readJsonFromDist('dist/settings');

const processRequest = query => {
  const params = parseParams({ mainContentMode: 'card-mode', ...query })
  const groupedItems = getGroupedItems({items: items, ...params})
    .map(group => {
      const items = group.items.map(({ id, name, href }) => ({ id, name, logo: `${settings.global.website}/${href}` }))
      return { ...group, items }
    })
  return params.grouping === 'no' ? flattenItems(groupedItems) : groupedItems
}
module.exports.processRequest = processRequest;

// Netlify function
function handler(event, context) {
  const body = processRequest(event.queryStringParameters)
  const headers = { 'Content-Type': 'application/json' }
  return { statusCode: 200, body: JSON.stringify(body), headers }
}
module.exports.handler = handler;
