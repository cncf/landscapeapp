import items from 'project/data'
import { global } from 'public/settings'
import { flattenItems } from '../../utils/itemsCalculator'
import getGroupedItems  from '../../utils/itemsCalculator'
import { parseParams } from '../../utils/routing'

const { website } = global

export default function handler(req, res) {
  const params = parseParams({ mainContentMode: 'card-mode', ...req.query })

  const groupedItems = getGroupedItems(params, items)
    .map(group => {
      const items = group.items.map(({ id, name, href }) => ({ id, name, logo: `${website}/${href}` }))
      return { ...group, items }
    })

  const body = params.grouping === 'no' ? flattenItems(groupedItems) : groupedItems
  res.status(200).json(body)
}
