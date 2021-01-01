/* eslint-disable import/no-named-as-default */
import React from 'react';
import PropTypes from 'prop-types';

import { isZoomedIn } from "../utils/browserZoom";

// detect an initial prefix, like /cncf/ or /lfai/ , but it can be just /
const possiblePrefix = window.possiblePrefix || '';
const prefix = (possiblePrefix && location.pathname.indexOf(possiblePrefix) === 1) ? (possiblePrefix + '/') : '';
window.prefix = prefix;

// This is a class-based component because the current
// version of hot reloading won't hot reload a stateless
// component at the top-level.
class App extends React.Component {
  state = {
    isZoomed: false
  }

  componentDidMount () {
    this.checkZoomedIn();
    window.addEventListener("touchend", this.checkZoomedIn);
  }

  componentWillUnmount () {
    window.removeEventListener("touchend", this.checkZoomedIn);
  }

  checkZoomedIn = () => {
    this.setState({ isZoomed: isZoomedIn() })
  }

  render() {
    return (
      <div className={this.state.isZoomed ? "zoomed-in" : ""}>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element
};

export default App;
