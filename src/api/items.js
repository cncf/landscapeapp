import path from 'path';
import fs from 'fs';
const items = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'dist/data/items.json'), 'utf-8'));
const settings = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'dist/settings.json')));

import { flattenItems } from '../utils/itemsCalculator'
import getGroupedItems  from '../utils/itemsCalculator'
import { parseParams } from '../utils/routing'

export const processRequest = query => {
  const params = parseParams({ mainContentMode: 'card-mode', ...query })
  const groupedItems = getGroupedItems({items: data.items, ...params})
    .map(group => {
      const items = group.items.map(({ id, name, href }) => ({ id, name, logo: `${settings.global.website}/${href}` }))
      return { ...group, items }
    })
  return params.grouping === 'no' ? flattenItems(groupedItems) : groupedItems
}

// Netlify function
export async function handler(event, context) {
  const body = processRequest(event.queryStringParameters)
  const headers = { 'Content-Type': 'application/json' }
  return { statusCode: 200, body: JSON.stringify(body), headers }
}
