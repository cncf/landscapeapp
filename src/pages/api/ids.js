import items from 'project/data'
import { global } from 'public/settings'
import { flattenItems } from '../../utils/itemsCalculator'
import getGroupedItems  from '../../utils/itemsCalculator'
import { parseParams } from '../../utils/routing'

const { website } = global

export const processRequest = query => {
  const params = parseParams(query)
  const groupedItems = getGroupedItems({data: items, ...params})
    .map(group => {
      const items = group.items.map(({ id }) => ({ id } ))
      return { ...group, items }
    })
  return groupedItems;
}

// Next.js function
export default function nextHandler(req, res) {
  const body = processRequest(req.query)
  res.status(200).json(body)
}

// Netlify function
export async function handler(event, context) {
  const body = processRequest(event.queryStringParameters)
  const headers = { 'Content-Type': 'application/json' }
  return { statusCode: 200, body: JSON.stringify(body), headers }
}
