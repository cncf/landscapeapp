import { connect } from 'react-redux';
import qs from 'query-string';
import FullscreenLandscape from './FullscreenLandscape';
import { getGroupedItemsForMembersLandscape } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'

const mapStateToProps = (state) => ({
  ready: state.main.ready,
  groupedItems: state.main.ready && getGroupedItemsForMembersLandscape(state),
  landscapeSettings: settings.big_picture.third,
  showPreview:location.search.indexOf('preview') === -1,
  version:qs.parse(location.search).version
});
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenLandscape);
