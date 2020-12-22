import createSelector from '../utils/createSelector';
import HomePageComponent from '../components/HomePage';
import {showFilters, hideFilters, closeDialog } from '../reducers/mainReducer';
import isEmbed from '../utils/isEmbed';
import getGroupedItems, {getGroupedItemsForBigPicture } from '../utils/itemsCalculator';
import selectedItemCalculator from '../utils/selectedItemCalculator';
import settings from '../utils/settings'
import EntriesContext from '../contexts/EntriesContext'
import { projects } from '../../tools/loadData'
import Head from 'next/head'

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

const HomePage = ({ entries }) => {
  return <EntriesContext.Provider value={{entries}}>
    <Head>
      <title>{defaultTitle}</title>
    </Head>
    <HomePageComponent />
  </EntriesContext.Provider>
}

export async function getStaticProps(context) {
  return {
    props: { entries: projects }
  }
}

export default HomePage
