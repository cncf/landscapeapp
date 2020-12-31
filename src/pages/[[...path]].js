import HomePageComponent from '../components/HomePage';
import getGroupedItems, { getGroupedItemsForBigPicture } from '../utils/itemsCalculator';
import selectedItemCalculator from '../utils/selectedItemCalculator';
import settings from '../utils/settings'
import EntriesContext from '../contexts/EntriesContext'
import { projects } from '../../tools/loadData'
import Head from 'next/head'
import { findLandscapeSettings, landscapeSettingsList } from '../utils/landscapeSettings'
import routeToParams from '../utils/routeToParams'
import paramsToRoute from '../utils/paramsToRoute'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'
import FullscreenLandscape from '../components/BigPicture/FullscreenLandscape'

const defaultTitle =  settings.global.meta.title;

const HomePage = ({ entries, selectedItem }) => {
  const { params } = useContext(RootContext)
  const landscapeSettings = findLandscapeSettings(params.mainContentMode)
  const isBigPicture = params.mainContentMode !== 'card-mode'
  const groupedItems = getGroupedItems(params, entries)
  const groupedItemsForBigPicture = getGroupedItemsForBigPicture(params, entries, landscapeSettings)
  const selectedItemId = selectedItem && selectedItem.id
  const { nextItemId, previousItemId } = selectedItemCalculator(groupedItems, groupedItemsForBigPicture, selectedItemId, isBigPicture)

  // TODO: having currentParams and params is confusing
  const currentParams = routeToParams()
  const router = useRouter()
  const navigate = (newParams = {}) => {
    const filters = { ...(currentParams.filters || {}), ...(newParams.filters || {}) }
    const url = paramsToRoute({ ...currentParams, ...newParams, filters })
    router.push(url)
  }

  const title = selectedItem ? `${selectedItem.name} - ${defaultTitle}` : defaultTitle

  return <EntriesContext.Provider value={{entries, selectedItem, navigate, groupedItems, nextItemId, previousItemId }}>
    <Head>
      <title>{title}</title>
    </Head>
    { params.isReallyFullscreen ? <FullscreenLandscape /> : <HomePageComponent />}
  </EntriesContext.Provider>
}

export async function getStaticProps({ params }) {
  const { mainContentMode, selectedItemId } = routeToParams({ ...params, query: {} })
  const selectedItem = selectedItemId ? projects.find(item => item.id === selectedItemId) : null

  // TODO: navigating directly to an item URL will show an empy landscape in the background.
  if (selectedItemId) {
    return { props: { selectedItem, entries: [] } }
  } else {
    const entries = projects.map(project => {
      // TODO: need to much data to render the landscape. See if we can reduce amount of data
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
      props: { entries }
    }
  }
}

export async function getStaticPaths() {
  const landscapeUrls = landscapeSettingsList.map(({ url }) => url)
  const landscapePaths = landscapeUrls.flatMap(mainContentMode => {
    const basePaths = mainContentMode === 'landscape' ? [[], ['card-mode']] : [[mainContentMode]]

    // TODO: for now fullscreen landscapes are /fullscreen, /serverless/fullscreen, members/fullscreen
    // Not sure if this is the best way.
    // Also serverless/fullscreen is broken, probably because fullscreen is interpreted as selected item
    const fullScreenPath = [mainContentMode === 'landscape' ? null : mainContentMode, 'fullscreen']
      .filter(_ => _)

    return [
      ...basePaths,
      fullScreenPath
    ]
  })

  const itemPaths = projects.map(item => ['items', item.id])

  const paths = [...landscapePaths, ...itemPaths].map(path => ({ params: { path } }))

  return { paths, fallback: false }
}

export default HomePage
