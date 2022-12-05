const { flattenItems } = require('../utils/itemsCalculator');
const { getGroupedItems, expandSecondPathItems }  = require('../utils/itemsCalculator');
const { parseParams } = require('../utils/routing');
const Parser = require('json2csv/lib/JSON2CSVParser');
const { readJsonFromDist } = require('../utils/readJson');

const allItems = readJsonFromDist('data/items-export');
const projects = readJsonFromDist('data/items');

const processRequest = module.exports.processRequest = query => {
  const params = parseParams(query);
  const p = new URLSearchParams(query);
  params.format = p.get('format');

  let items = projects;
  if (params.grouping === 'landscape' || params.format !== 'card') {
    items = expandSecondPathItems(items);
  }

  // extract alias - if grouping = category
  // extract alias - if params != card-mode (big_picture - always show)
  // i.e. make a copy to items here - to get a list of ids

  const selectedItems = flattenItems(getGroupedItems({data: items, skipDuplicates: params.format === 'card', ...params}))
    .reduce((acc, item) => ({ ...acc, [item.id]: true }), {})

  const fields = allItems[0].map(([label]) => label !== 'id' && label).filter(_ => _);
  const itemsForExport = allItems
    .map(item => item.reduce((acc, [label, value]) =>  ({ ...acc, [label]: value }), {}))
    .filter(item => selectedItems[item.id]);

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(itemsForExport, { fields });
  return csv;
}

// Netlify function
module.exports.handler = async function(event) {
  const body = processRequest(event.queryStringParameters)
  const headers = {
      'Content-Type': 'text/css',
      'Content-Disposition': 'attachment; filename=interactive-landscape.csv'
  };
  return { statusCode: 200, body: body, headers }
}
if (__filename === process.argv[1]) {
  console.info(processRequest(process.argv[2]), null, 4);
}

