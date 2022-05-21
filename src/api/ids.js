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
  const params = parseParams(query);
  const p = new URLSearchParams(query);
  params.format = p.get('format');
  const summary = getSummary({data: items, ...params});
  const groupedItems = getGroupedItems({data: items, ...params})
    .map(group => {
      const items = group.items.map(({ id }) => ({ id } ))
      return { ...group, items }
    })

  return {
    summaryText: getSummaryText(summary),
    items: groupedItems
  }
}
module.exports.processRequest = processRequest;

// Netlify function
module.exports.handler = fuction(event, context) {
  const body = processRequest(event.queryStringParameters)
  const headers = { 'Content-Type': 'application/json' }
  return { statusCode: 200, body: JSON.stringify(body), headers }
}

if (__filename === process.argv[1]) {
  console.info(JSON.stringify(processRequest(process.argv[2]), null, 4));
}
