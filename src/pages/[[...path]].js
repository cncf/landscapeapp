import HomePageComponent from '../components/HomePage';
import getGroupedItems, { getGroupedItemsForBigPicture } from '../utils/itemsCalculator';
import selectedItemCalculator from '../utils/selectedItemCalculator';
import settings from 'project/settings.yml';
import EntriesContext from '../contexts/EntriesContext'
import { projects } from '../../tools/loadData'
import Head from 'next/head'
import { findLandscapeSettings, landscapeSettingsList } from '../utils/landscapeSettings'
import routeToParams from '../utils/routeToParams'
import paramsToRoute from '../utils/paramsToRoute'
import FullscreenLandscape from '../components/BigPicture/FullscreenLandscape'
import { calculateSize } from '../utils/landscapeCalculations'
import { useRouter } from 'next/router'

const defaultTitle =  settings.global.meta.title;

const HomePage = ({ entries }) => {
  const params = routeToParams()
  const router = useRouter()

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
    router.push(url, undefined, { shallow: true })
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
    <Head>
      <title>{defaultTitle}</title>
    </Head>
    { params.isReallyFullscreen ? <FullscreenLandscape /> : <HomePageComponent />}
  </EntriesContext.Provider>
}

export async function getStaticProps({ params }) {
  // Apparently we're not filtering by mainContentMode. See if using it would improve performance
  const entries = projects.map(project => {
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

  const paths = landscapePaths.map(path => ({ params: { path } }))

  return { paths, fallback: false }
}

export default HomePage
