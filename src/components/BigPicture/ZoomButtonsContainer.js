import React from 'react';
import { connect } from 'react-redux';
import ZoomButtons from './ZoomButtons';
import { makeZoomIn, makeZoomOut, makeZoomReset} from '../../reducers/mainReducer';
import { zoomLevels } from '../../utils/zoom';


class ZoomButtonsContainer extends React.PureComponent {
  state = { distances: [] };

  componentDidMount() {
    window.addEventListener("touchmove", this.capturePinch, { passive: false });
    window.addEventListener("touchend", this.changeZoom, { passive: false });
  }

  componentWillUnmount() {
    window.removeEventListener("touchmove", this.capturePinch);
    window.removeEventListener("touchend", this.changeZoom);
  }

  capturePinch = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt((touch1.screenX - touch2.screenX) ** 2 + (touch1.screenY - touch2.screenY) ** 2)
      this.setState(({ distances }) => {
        const initialDistance = distances.length === 0 ? distance : distances[0];
        return { distances: [initialDistance, distance] }
      });

      e.preventDefault();
    }
  }

  changeZoom = () => {
    const { distances } = this.state;
    if (distances.length > 0) {
      const { onZoomIn, onZoomOut, canZoomIn, canZoomOut } = this.props;
      const [initialDistance, lastDistance] = distances;
      const scale = lastDistance / initialDistance;

      if (scale !== 1) {
        scale > 1 ? canZoomIn && onZoomIn() : canZoomOut && onZoomOut();
      }

      this.setState({ distances: [] });
    }
  }

  render () {
    return <ZoomButtons {...this.props} />
  }
}

const mapStateToProps = (state) => ({
  canZoomOut: state.main.zoom !== zoomLevels[0],
  canZoomIn: state.main.zoom !== zoomLevels.slice(-1)[0],
  zoomText: Math.round(state.main.zoom * 100) + '%'
});

const mapDispatchToProps = {
  onZoomIn: makeZoomIn,
  onZoomOut: makeZoomOut,
  onZoomReset: makeZoomReset
};

export default connect(mapStateToProps, mapDispatchToProps)(ZoomButtonsContainer);
