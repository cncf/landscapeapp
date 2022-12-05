const { expandSecondPathItems } = require('../utils/itemsCalculator');
const { getGroupedItems }  = require('../utils/itemsCalculator');
const { getSummary, getSummaryText } = require('../utils/summaryCalculator');
const { parseParams } = require('../utils/routing');
const { readJsonFromDist } = require('../utils/readJson');

const projects = readJsonFromDist('data/items');

const processRequest = module.exports.processRequest = query => {
  const params = parseParams(query);
  const p = new URLSearchParams(query);
  params.format = p.get('format');

  let items = projects;
  if (params.grouping === 'landscape' || params.format !== 'card') {
    items = expandSecondPathItems(items);
  }

  const summary = getSummary({data: items, ...params});
  const groupedItems = getGroupedItems({data: items, skipDuplicates: params.format === 'card', ...params })
    .map(group => {
      const items = group.items.map(({ id }) => ({ id } ))
      return { ...group, items }
    })

  return {
    summaryText: getSummaryText(summary),
    items: groupedItems
  }
}

// Netlify function
module.exports.handler = async function(event) {
  const body = processRequest(event.queryStringParameters)
  const headers = { 'Content-Type': 'application/json' }
  return { statusCode: 200, body: JSON.stringify(body), headers }
}

if (__filename === process.argv[1]) {
  console.info(JSON.stringify(processRequest(process.argv[2]), null, 4));
}
