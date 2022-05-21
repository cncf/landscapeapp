const path = require('path');
const fs = require('fs');

const { flattenItems } = require('../utils/itemsCalculator');
const { getGroupedItems }  = require('../utils/itemsCalculator');
const { getSummary, getSummaryText } = require('../utils/summaryCalculator');
const { parseParams } = require('../utils/routing');
const Parser = require('json2csv/lib/JSON2CSVParser');
const { readJsonFromDist } = require('../utils/readJson');

const allItems = readJsonFromDist('dist/data/items-export');
const items = readJsonFromDist('dist/data/items');
const settings = readJsonFromDist('dist/settings');

const processRequest = query => {
  const params = parseParams(query);
  const p = new URLSearchParams(query);
  params.format = p.get('format');

  const selectedItems = flattenItems(getGroupedItems({data: items, ...params}))
    .reduce((acc, item) => ({ ...acc, [item.id]: true }), {})

  const fields = allItems[0].map(([label, _]) => label !== 'id' && label).filter(_ => _);
  const itemsForExport = allItems
    .map(item => item.reduce((acc, [label, value]) =>  ({ ...acc, [label]: value }), {}))
    .filter(item => selectedItems[item.id]);

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(itemsForExport, { fields });
  return csv;
}
module.exports.processRequest = processRequest;

// Netlify function
function handler(event, context) {
  const body = processRequest(event.queryStringParameters)
  const headers = {
      'Content-Type': 'text/css',
      'Content-Disposition': 'attachment; filename=interactive-landscape.csv'
  };
  return { statusCode: 200, body: body, headers }
}
module.exports.handler = handler;

if (__filename === process.argv[1]) {
  console.info(JSON.stringify(processRequest(process.argv[2]), null, 4));
}

