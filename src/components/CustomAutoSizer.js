import * as React from 'react';
import { connect } from "react-redux";

class AutoSizer extends React.PureComponent {
  state = {
    height: this.props.defaultHeight || 0
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
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._onResize);
  }

  componentDidUpdate (prevProps) {
    if (this.props.location != prevProps.location) {
      this._onResize();
    }
  }

  render() {
    const { children } = this.props;
    const { height } = this.state;

    // Outer div should not force width/height since that may prevent containers from shrinking.
    // Inner component should overflow and use calculated width/height.
    // See issue #68 for more information.
    const childParams = { height };

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

  _onResize = () => {
    if (this._parentNode) {
      const height = this.state.height + window.innerHeight - document.body.offsetHeight;

      this.setState({ height: height });
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
