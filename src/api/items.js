const { flattenItems, expandSecondPathItems } = require('../utils/itemsCalculator');
const { getGroupedItems }  = require('../utils/itemsCalculator');
const { parseParams } = require('../utils/routing');
const { readJsonFromDist } = require('../utils/readJson');

const projects = readJsonFromDist('data/items');
const settings = readJsonFromDist('settings');

const processRequest = module.exports.processRequest = query => {
  const params = parseParams({ mainContentMode: 'card-mode', ...query })
  // extract alias - if grouping = category
  // extract alias - if params != card-mode (big_picture - always show)
  // i.e. make a copy to items here - to get a list of ids
  let items = projects;
  if (params.grouping === 'landscape') {
    items = expandSecondPathItems(items);
  }

  const groupedItems = getGroupedItems({data: items, ...params, skipDuplicates: true})
    .map(group => {
      const items = group.items.map(({ id, name, href }) => ({ id, name, logo: `${settings.global.website}/${href}` }))
      return { ...group, items }
    })
  return params.grouping === 'no' ? flattenItems(groupedItems) : groupedItems
}
// Netlify function
module.exports.handler = async function(event) {
  const body = processRequest(event.queryStringParameters)
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }
  return { statusCode: 200, body: JSON.stringify(body), headers }
}
