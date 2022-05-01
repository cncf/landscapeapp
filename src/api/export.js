import allItems from 'public/data/items-export';
import items from 'project/data';
import { global } from 'public/settings';
import { flattenItems } from '../utils/itemsCalculator';
import getGroupedItems  from '../utils/itemsCalculator';
import getSummary, { getSummaryText } from '../utils/summaryCalculator';
import { parseParams } from '../utils/routing';
import Parser from 'json2csv/lib/JSON2CSVParser';

const { website } = global
export const processRequest = query => {
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

// Netlify function
export async function handler(event, context) {
  const body = processRequest(event.queryStringParameters)
  const headers = { 'Content-Type': 'application/json' }
  return { statusCode: 200, body: JSON.stringify(body), headers }
}
