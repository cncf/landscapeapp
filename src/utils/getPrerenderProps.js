import getGroupedItems, { getGroupedItemsForBigPicture } from './itemsCalculator'
import { projects } from '../../tools/loadData'

const getFilteredItems = (params) => {
  const items = getGroupedItemsForBigPicture(params, projects)
    .flatMap(({ subcategories }) => subcategories.flatMap(({ items }) => items))

  if (items.length > 0) {
    return items
  }

  return getGroupedItems(params, projects).flatMap(group => group.items)
}

const getPrerenderProps = params => {
  const items = getFilteredItems(params)
  const entries = items.map(project => {
    const keys = [
      'name', 'stars', 'organization', 'path', 'landscape', 'category', 'oss', 'href', 'id',
      'flatName', 'member', 'relation', 'project', 'isSubsidiaryProject', 'amount', 'amountKind',
      'headquarters', 'license', 'bestPracticeBadgeId', 'enduser'
    ]

    const entry = keys.reduce((hash, key) => {
      const value = project[key]
      return {
        ...hash,
        ...(value || value === false ? { [key]: project[key] } : {})
      }
    }, {})

    const languages = ((project.github_data || {}).languages || []).map(({ name }) => ({ name }))
    const parents = (project.crunchbaseData || {}).parents || []

    return {
      ...entry,
      github_data: { languages },
      crunchbaseData: { parents }
    }
  })

  return { entries }
}

export default getPrerenderProps
