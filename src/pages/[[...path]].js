import createSelector from '../utils/createSelector';
import HomePageComponent from '../components/HomePage';
import {showFilters, hideFilters, closeDialog } from '../reducers/mainReducer';
import isEmbed from '../utils/isEmbed';
import getGroupedItems, { getFilteredItems, getGroupedItemsForBigPicture } from '../utils/itemsCalculator';
import selectedItemCalculator from '../utils/selectedItemCalculator';
import settings from '../utils/settings'
import EntriesContext from '../contexts/EntriesContext'
import { projects } from '../../tools/loadData'
import Head from 'next/head'
import { findLandscapeSettings, landscapeSettingsList } from '../utils/landscapeSettings'
import { initialState } from './_app'
import routeToParams from '../utils/routeToParams'
import paramsToRoute from '../utils/paramsToRoute'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import RootContext from '../contexts/RootContext'

const defaultTitle =  settings.global.meta.title;

// TODO: sort this
const getTitle = createSelector([state => state], function(state) {
    if (!state.main.ready) {
      return defaultTitle;
    }
    const groupedItems = getGroupedItems(state);
    const groupedItemsForBigPicture = getGroupedItemsForBigPicture(state);
    const selectedItemId = state.main.selectedItemId;
    const isBigPicture = state.main.mainContentMode !== 'card';
    const selectedItemInfo = selectedItemCalculator(groupedItems, groupedItemsForBigPicture, selectedItemId, isBigPicture);
    return selectedItemInfo.hasSelectedItem ? `${selectedItemInfo.itemInfo.name} - ${defaultTitle}` : defaultTitle;
});

const mapStateToProps = (state) => ({
  ready: state.main.ready,
  filtersVisible: state.main.filtersVisible && !isEmbed(),
  isFullscreen: state.main.isFullscreen && state.main.mainContentMode !== 'card',
  mainContentMode: state.main.mainContentMode,
  hasSelectedItem: !!state.main.selectedItemId,
  title: getTitle(state)
});
const mapDispatchToProps = {
  showFilters: showFilters,
  hideFilters: hideFilters,
  onClose: closeDialog
};

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
  const navigate = ({selectedItemId} = {}) => {
    const url = paramsToRoute({ ...currentParams, selectedItemId })
    router.push(url)
  }

  return <EntriesContext.Provider value={{entries, selectedItem, navigate, groupedItems, nextItemId, previousItemId }}>
    <Head>
      <title>{defaultTitle}</title>
    </Head>
    <HomePageComponent />
  </EntriesContext.Provider>
}

export async function getStaticProps({ params }) {
  const { mainContentMode, selectedItemId } = routeToParams(params)
  const selectedItem = selectedItemId ? projects.find(item => item.id === selectedItemId) : null

  const entries = projects.map(project => {
    const keys = [
      'name', 'stars', 'organization', 'path', 'landscape', 'category', 'oss', 'href', 'id',
      'flatName', 'member', 'relation', 'project', 'isSubsidiaryProject', 'amount', 'amountKind'
    ]

    const entry = keys.reduce((hash, key) => {
      const value = project[key]
      return {
        ...hash,
        ...(value || value === false ? { [key]: project[key] } : {})
      }
    }, {})

    return entry
  })

  return {
    props: { entries, selectedItem }
  }
}

export async function getStaticPaths() {
  const landscapeUrls = landscapeSettingsList.map(({ url }) => url)
  const paths = landscapeUrls.flatMap(mainContentMode => {
    const items = getFilteredItems({ ...initialState, mainContentMode }, projects)

    const basePaths = mainContentMode === 'landscape' ? [[], ['card-mode']] : [[mainContentMode]]

    return [
      ...basePaths,
      ...basePaths.flatMap(path => {
        return items.map(item => [path[0], 'items', item.id].filter(_ => _))
      })
    ]
  })

  return {
    paths: paths.map(path => {
      return { params: { path } }
    }),
    fallback: false
  }
}

export default HomePage