import { connect } from 'react-redux';
import MainContent2 from './MainContent2';
import { changeSelectedItemId, changeMainContentMode } from '../../reducers/mainReducer';
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'


const mapStateToProps = (state) => ({
  groupedItems: getGroupedItemsForBigPicture(state),
  zoom: state.main.zoom,
  landscapeSettings: settings.big_picture.main,
  showPreview: true
});
const mapDispatchToProps = {
  onSelectItem: changeSelectedItemId,
  switchToServerless: () => changeMainContentMode('serverless')
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContent2);
