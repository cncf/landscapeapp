import { getGroupedItemsForContentMode, flattenItems } from './itemsCalculator'
import { projects } from '../../tools/loadData'

const getPrerenderProps = params => {
  const items = flattenItems(getGroupedItemsForContentMode(params, projects))
  const entries = items.map(project => {
    const keys = [
      'name', 'stars', 'organization', 'path', 'landscape', 'category', 'oss', 'href', 'id',
      'flatName', 'member', 'relation', 'project', 'isSubsidiaryProject', 'amount', 'amountKind',
      'headquarters', 'license', 'bestPracticeBadgeId', 'enduser', 'joined', 'industries'
    ]

    const entry = keys.reduce((hash, key) => {
      const value = project[key]
      return {
        ...hash,
        ...(value || value === false ? { [key]: project[key] } : {})
      }
    }, {})

    const languages = ((project.github_data || {}).languages || []).map(({ name }) => ({ name }))
    const crunchbaseData = project.crunchbaseData || {}

    const parents = crunchbaseData.parents || []
    const company_type = crunchbaseData.company_type || ''

    return {
      ...entry,
      github_data: { languages },
      crunchbaseData: { parents, company_type }
    }
  })

  return { entries }
}

export default getPrerenderProps
