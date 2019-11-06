import { connect } from 'react-redux';
import qs from 'query-string';
import FullscreenLandscape from './FullscreenLandscape';
import { getGroupedItemsForMainLandscape } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'

const mapStateToProps = (state) => ({
  ready: state.main.ready,
  groupedItems: state.main.ready && getGroupedItemsForMainLandscape(state),
  landscapeSettings: settings.big_picture.main,
  showPreview:location.search.indexOf('preview') === -1,
  version:qs.parse(location.search).version
});
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenLandscape);
