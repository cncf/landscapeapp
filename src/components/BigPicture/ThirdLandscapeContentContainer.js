import { connect } from 'react-redux';
import LandscapeContent from './LandscapeContent';
import { changeSelectedItemId, changeMainContentMode } from '../../reducers/mainReducer';
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'

const mainSettings = settings.big_picture.main;
const thirdSettings = settings.big_picture.third || {};

const mapStateToProps = (state) => ({
  groupedItems: getGroupedItemsForBigPicture(state),
  zoom: state.main.zoom,
  landscapeSettings: thirdSettings,
  showPreview: true
});
const mapDispatchToProps = {
  onSelectItem: changeSelectedItemId,
  switchToOther: () => changeMainContentMode(mainSettings.url)
};

export default connect(mapStateToProps, mapDispatchToProps)(LandscapeContent);
