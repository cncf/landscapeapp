import { connect } from 'react-redux';
import qs from 'query-string';
import FullscreenLandscape from './FullscreenLandscape';
import { bigPictureMethods } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'
const thirdSettings = settings.big_picture.third;

const mapStateToProps = (state) => ({
  ready: state.main.ready,
  groupedItems: state.main.ready && bigPictureMethods[thirdSettings.method](state),
  landscapeSettings: settings.big_picture.third,
  showPreview:location.search.indexOf('preview') === -1,
  version:qs.parse(location.search).version
});
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenLandscape);
