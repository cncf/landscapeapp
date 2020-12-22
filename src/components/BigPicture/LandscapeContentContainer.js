import LandscapeContent from './LandscapeContent';
import { changeSelectedItemId, changeMainContentMode } from '../../reducers/mainReducer';
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator';
import { findLandscapeSettings } from "../../utils/landscapeSettings";

const mapStateToProps = (state) => {
  const landscapeSettings = findLandscapeSettings(state.main.mainContentMode);

  return {
    groupedItems: getGroupedItemsForBigPicture(state, landscapeSettings),
    zoom: state.main.zoom,
    landscapeSettings: landscapeSettings
  }
};

// TODO: pass this to LandscapeContent
const mapDispatchToProps = {
  onSelectItem: changeSelectedItemId,
  switchToLandscape: changeMainContentMode,
};

export default LandscapeContent
