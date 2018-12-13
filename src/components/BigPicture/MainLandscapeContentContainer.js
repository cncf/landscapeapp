import { connect } from 'react-redux';
import LandscapeContent from './LandscapeContent';
import { changeSelectedItemId, changeMainContentMode } from '../../reducers/mainReducer';
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'

const mainSettings = settings.big_picture.main;
const extraSettings = settings.big_picture.extra || {};

const mapStateToProps = (state) => ({
  groupedItems: getGroupedItemsForBigPicture(state),
  zoom: state.main.zoom,
  landscapeSettings: mainSettings,
  showPreview: true
});
const mapDispatchToProps = {
  onSelectItem: changeSelectedItemId,
  switchToOther: () => changeMainContentMode(extraSettings.url)
};

export default connect(mapStateToProps, mapDispatchToProps)(LandscapeContent);
