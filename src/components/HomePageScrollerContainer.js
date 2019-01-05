import { pure } from 'recompose';
import { connect } from 'react-redux';
import getGroupedItems from '../utils/itemsCalculator';

const mapStateToProps = (state) => ({
  groupedItems: getGroupedItems(state)
});
const mapDispatchToProps = {
};

const Component = function({groupedItems}) {
  setTimeout(function() {
    (document.scrollingElement || document.body).scrollTop = 0;
  }, 1);
  return null;
}

export default connect(mapStateToProps, mapDispatchToProps)(pure(Component));
