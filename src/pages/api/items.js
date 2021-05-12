import items from 'project/data'
import { global } from 'public/settings'
import { flattenItems } from '../../utils/itemsCalculator'
import getGroupedItems  from '../../utils/itemsCalculator'
import { parseParams } from '../../utils/routing'

const { website } = global

const processRequest = query => {
  const params = parseParams({ mainContentMode: 'card-mode', ...query })

  const groupedItems = getGroupedItems(params, items)
    .map(group => {
      const items = group.items.map(({ id, name, href }) => ({ id, name, logo: `${website}/${href}` }))
      return { ...group, items }
    })

  return params.grouping === 'no' ? flattenItems(groupedItems) : groupedItems
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
