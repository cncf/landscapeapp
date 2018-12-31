import { connect } from 'react-redux';
import getGroupedItems from '../utils/itemsCalculator';

const mapStateToProps = (state) => ({
  groupedItems: getGroupedItems(state)
});
const mapDispatchToProps = {
};

let oldValue = null;
const Component = function({groupedItems}) {
  if (groupedItems === oldValue) {
    return null;
  }
  if (groupedItems !== oldValue) {
    console.info(groupedItems, oldValue);
  }
  oldValue = groupedItems;
  setTimeout(function() {
    document.scrollingElement.scrollTop = 0;
  }, 1);
  return null;
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
