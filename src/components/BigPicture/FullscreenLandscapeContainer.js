import { connect } from 'react-redux';
import FullscreenLandscape from './FullscreenLandscape';
import settings from 'project/settings.yml'

const mapStateToProps = (state) => ({
  ready: state.main.ready,
  landscapeSettings: settings.big_picture.main
});
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenLandscape);
