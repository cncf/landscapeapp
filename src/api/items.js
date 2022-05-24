import path from 'path';
import fs from 'fs';
import projects from 'dist/data/items';
import settings from 'dist/settings'

import { flattenItems, expandSecondPathItems } from '../utils/itemsCalculator'
import getGroupedItems  from '../utils/itemsCalculator'
import { parseParams } from '../utils/routing'

export const processRequest = query => {
  const params = parseParams({ mainContentMode: 'card-mode', ...query })
  // extract alias - if grouping = category
  // extract alias - if params != card-mode (big_picture - always show)
  // i.e. make a copy to items here - to get a list of ids
  let items = projects;
  if (params.grouping === 'landscape') {
    items = expandSecondPathItems(items);
  }

  const groupedItems = getGroupedItems({items: items, ...params})
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
