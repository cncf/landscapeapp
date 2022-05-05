import path from 'path';
import fs from 'fs';
const projectPath = process.env.PROJECT_PATH;
const items = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'dist/data/items.json'), 'utf-8'));
const settings = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'dist/settings.json')));

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
