import * as React from 'react';
import { connect } from "react-redux";

class AutoSizer extends React.PureComponent {
  state = {
    height: this.props.defaultHeight || 0,
    zoomedIn: false
  };

  componentDidMount() {
    if (
      this._autoSizer &&
      this._autoSizer.parentNode &&
      this._autoSizer.parentNode.ownerDocument &&
      this._autoSizer.parentNode.ownerDocument.defaultView &&
      this._autoSizer.parentNode instanceof
        this._autoSizer.parentNode.ownerDocument.defaultView.HTMLElement
    ) {
      // Delay access of parentNode until mount.
      // This handles edge-cases where the component has already been unmounted before its ref has been set,
      // As well as libraries like react-lite which have a slightly different lifecycle.
      this._parentNode = this._autoSizer.parentNode;

      // Defer requiring resize handler in order to support server-side rendering.
      // See issue #41
      this._onResize();
      window.addEventListener("resize", this._onResize);
      window.addEventListener("touchend", this.onPossiblyZoomed);
      this.setState({ zoomedIn: this.isZoomedIn() });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("touchend", this.onPossiblyZoomed);
  }

  componentDidUpdate (prevProps) {
    if (this.props.location !== prevProps.location) {
      this._onResize();
    }
  }

  isZoomedIn = () => {
    const scale = window.visualViewport ? visualViewport.scale : screen.width / window.innerWidth;
    return scale > 1;
  }

  render() {
    const { children } = this.props;
    const { height, zoomedIn } = this.state;

    // Outer div should not force width/height since that may prevent containers from shrinking.
    // Inner component should overflow and use calculated width/height.
    // See issue #68 for more information.
    const childParams = { height, zoomedIn };

    return (
      <div
        ref={this._setRef}
        style={{
          overflow: 'visible',
          width: '100%',
        }}>
        {children(childParams)}
      </div>
    );
  }

  onPossiblyZoomed = (e) => {
    const windowHeight = window.innerHeight;
    const zoomedIn = this.isZoomedIn();
    this.setState({ zoomedIn }, this._onResize);
    console.log(zoomedIn)

    for (let i = 1; i < 11; i++) {
      const timeout = i * 50;

      setTimeout(() => {
        if (window.innerHeight !== windowHeight) {
          this._onResize();
        }
      }, timeout)
    }
  }

  _onResize = () => {
    if (this._parentNode) {
      const height = this._autoSizer.clientHeight + window.innerHeight - document.body.offsetHeight;
      const zoomedIn = this.isZoomedIn();
      this.setState({ height: zoomedIn ? 'auto' : height, zoomedIn });
    }
  };

  _setRef = (autoSizer) => {
    this._autoSizer = autoSizer;
  };
}

const mapStateToProps = ({ router }) => ({
  location: router.location
});

export default connect(mapStateToProps)(AutoSizer);
