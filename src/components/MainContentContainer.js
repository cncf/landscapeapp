import { connect } from 'react-redux';
import MainContent from './MainContent';
import { openSelectedItemIdInNewTab, changeSelectedItemId} from '../reducers/mainReducer';
import getGroupedItems from '../utils/itemsCalculator';


const mapStateToProps = (state) => ({
  cardMode: state.main.cardMode,
  groupedItems: getGroupedItems(state)
});
const mapDispatchToProps = {
  onSelectItem: changeSelectedItemId,
  onOpenItemInNewTab: openSelectedItemIdInNewTab
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContent);
