import { connect } from 'react-redux';
import LandscapeContent from './LandscapeContent';
import { changeSelectedItemId, changeMainContentMode } from '../../reducers/mainReducer';
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'

const extraSettings = settings.big_picture.extra || {};

const mapStateToProps = (state) => ({
  groupedItems: getGroupedItemsForBigPicture(state, settings.big_picture.extra),
  zoom: state.main.zoom,
  landscapeSettings: extraSettings,
  showPreview: true
});
const mapDispatchToProps = {
  onSelectItem: changeSelectedItemId,
  switchToLandscape: changeMainContentMode
};

export default connect(mapStateToProps, mapDispatchToProps)(LandscapeContent);
