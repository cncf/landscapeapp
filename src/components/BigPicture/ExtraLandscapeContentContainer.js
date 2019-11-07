import { connect } from 'react-redux';
import LandscapeContent from './LandscapeContent';
import { changeSelectedItemId, changeMainContentMode } from '../../reducers/mainReducer';
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'

const mainSettings = settings.big_picture.main;
const extraSettings = settings.big_picture.extra || {};
const thirdSettings = settings.big_picture.third || {};

const mapStateToProps = (state) => ({
  groupedItems: getGroupedItemsForBigPicture(state, settings.big_picture.extra),
  zoom: state.main.zoom,
  landscapeSettings: extraSettings,
  showPreview: true
});
const mapDispatchToProps = {
  onSelectItem: changeSelectedItemId,
  switchToOther: () => changeMainContentMode(mainSettings.url),
  switchToThird: () => changeMainContentMode(thirdSettings.url)
};

export default connect(mapStateToProps, mapDispatchToProps)(LandscapeContent);
