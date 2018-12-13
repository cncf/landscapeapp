import { connect } from 'react-redux';
import qs from 'query-string';
import FullscreenLandscape from './FullscreenLandscape';
import { bigPictureMethods } from '../../utils/itemsCalculator';
import settings from 'project/settings.yml'
const extraSettings = settings.big_picture.extra;

const mapStateToProps = (state) => ({
  ready: state.main.ready,
  groupedItems: state.main.ready && bigPictureMethods[extraSettings.method](state),
  landscapeSettings: settings.big_picture.extra,
  showPreview:location.search.indexOf('preview') === -1,
  version:qs.parse(location.search).version
});
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenLandscape);
