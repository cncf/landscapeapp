import path from 'path';
import fs from 'fs';
import items from 'dist/data/items';
import settings from 'dist/settings'

import { flattenItems } from '../utils/itemsCalculator'
import getGroupedItems  from '../utils/itemsCalculator'
import getSummary, { getSummaryText } from '../utils/summaryCalculator';
import { parseParams } from '../utils/routing'

export const processRequest = query => {
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

// Netlify function
export async function handler(event, context) {
  const body = processRequest(event.queryStringParameters)
  const headers = { 'Content-Type': 'application/json' }
  return { statusCode: 200, body: JSON.stringify(body), headers }
}

if (__filename === process.argv[1]) {
  console.info(JSON.stringify(processRequest(process.argv[2]), null, 4));
}
