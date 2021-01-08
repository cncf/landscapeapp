import HomePageComponent from '../components/HomePage';
import getGroupedItems, { getGroupedItemsForBigPicture } from '../utils/itemsCalculator';
import selectedItemCalculator from '../utils/selectedItemCalculator';
import EntriesContext from '../contexts/EntriesContext'
import { projects } from '../../tools/loadData'
import { findLandscapeSettings, landscapeSettingsList } from '../utils/landscapeSettings'
import routeToParams from '../utils/routeToParams'
import paramsToRoute from '../utils/paramsToRoute'
import FullscreenLandscape from '../components/BigPicture/FullscreenLandscape'
import { calculateSize } from '../utils/landscapeCalculations'
import { useRouter } from 'next/router'
import settings from 'project/settings.yml'


const HomePage = ({ entries, pageParams }) => {
  const router = useRouter()
  const params = routeToParams({ ...pageParams, ...router.query })

  const landscapeSettings = findLandscapeSettings(params.mainContentMode)
  const isBigPicture = params.mainContentMode !== 'card-mode'
  const groupedItems = getGroupedItems(params, entries)
  const groupedItemsForBigPicture = getGroupedItemsForBigPicture(params, entries, landscapeSettings)
  const selectedItemId = params.selectedItemId
  const { nextItemId, previousItemId } = selectedItemCalculator(groupedItems, groupedItemsForBigPicture, selectedItemId, isBigPicture)
  const size = calculateSize(landscapeSettings)

  const navigate = (newParams = {}) => {
    const filters = { ...(params.filters || {}), ...(newParams.filters || {}) }
    const url = paramsToRoute({ ...params, ...newParams, filters })
    router.push(url)
  }

  const baseProps = {
    entries,
    navigate,
    groupedItems,
    nextItemId,
    previousItemId,
    params,
    landscapeSettings,
    groupedItemsForBigPicture,
    ...size
  }

  return <EntriesContext.Provider value={baseProps}>
    { params.isReallyFullscreen ? <FullscreenLandscape /> : <HomePageComponent />}
  </EntriesContext.Provider>
}

const decodeMainContentMode = path => {
  const defaultContentMode = settings.big_picture.main.url
  if (!path) {
    return defaultContentMode
  }
  if (path[0] === 'pages') {
    return 'card-mode'
  }
  return (path[0] === 'fullscreen' ? path[1] : path[0]) || defaultContentMode
}

const decodeReallyFullscreen = path => !!path && path[0] === 'fullscreen'

export async function getStaticProps(context) {
  const { path } = context.params
  const mainContentMode = decodeMainContentMode(path)
  const isReallyFullscreen = decodeReallyFullscreen(path)
  const additionalParams = path && path[0] === 'pages' ? { enduser: 'yes', style: 'logo', embed: 'yes' } : {}
  const params = routeToParams({ mainContentMode, isReallyFullscreen })
  const items = getGroupedItemsForBigPicture(params, projects)
    .flatMap(({ subcategories }) => subcategories.flatMap(({ items }) => items))
  const entries = (items.length > 0 ? items : projects).map(project => {
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

  return {
    props: { entries, pageParams: { mainContentMode, isReallyFullscreen, ...additionalParams } }
  }
}

export async function getStaticPaths() {
  const landscapePaths = landscapeSettingsList.flatMap(({ basePath, isMain }) => {
    const basePaths = isMain ? [[], ['card-mode']] : [[basePath]]

    const fullScreenPath = ['fullscreen', basePath]
      .filter(_ => _)

    return [
      ...basePaths,
      fullScreenPath,
      ['pages', 'end-users']
    ]
  })

  const paths = landscapePaths.map(path => ({ params: { path } }))

  return { paths, fallback: false }
}

export default HomePage
