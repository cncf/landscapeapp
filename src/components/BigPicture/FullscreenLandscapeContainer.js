import { connect } from 'react-redux';
import qs from 'query-string';
import FullscreenLandscape from './FullscreenLandscape';
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator';

const mapStateToProps = (state, { landscapeSettings }) => ({
  ready: state.main.ready,
  groupedItems: state.main.ready && getGroupedItemsForBigPicture(state, landscapeSettings),
  version: qs.parse(location.search).version
});
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenLandscape);
