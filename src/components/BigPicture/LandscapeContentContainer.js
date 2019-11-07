import { connect } from 'react-redux';
import LandscapeContent from './LandscapeContent';
import { changeSelectedItemId, changeMainContentMode } from '../../reducers/mainReducer';
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'

const mapStateToProps = (state) => {
  const landscapeSettings = Object.values(settings.big_picture).find(({ url }) => url === state.main.mainContentMode);

  return {
    groupedItems: getGroupedItemsForBigPicture(state, landscapeSettings),
    zoom: state.main.zoom,
    landscapeSettings: landscapeSettings,
    showPreview: true
  }
};
const mapDispatchToProps = {
  onSelectItem: changeSelectedItemId,
  switchToLandscape: changeMainContentMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(LandscapeContent);
