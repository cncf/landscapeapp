/* eslint-disable import/no-named-as-default */
import React from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Switch, Route } from 'react-router-dom';

import { FullscreenLandscapeContainer } from "./BigPicture";
import HomePageContainer from './HomePageContainer';
import AcquisitionsContainer from './AcquisitionsContainer';
import NotFoundPage from './NotFoundPage';
import { isZoomedIn } from "../utils/browserZoom";
import { landscapeSettingsList } from "../utils/landscapeSettings";

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

  fullscreenLandscapes = () => {
    return landscapeSettingsList.map((landscapeSettings) => {
      const url = landscapeSettings.url
      const renderer = (props) => <FullscreenLandscapeContainer {...props} landscapeSettings={landscapeSettings} />
      return <Route exact path={`/${prefix}${url}`} render={renderer} key={url} />
    })
  }

  render() {
    return (
      <div className={this.state.isZoomed ? "zoomed-in" : ""}>
        <CssBaseline />
        <Switch>
          <Route exact path={`/${prefix}`} component={HomePageContainer} />
          { this.fullscreenLandscapes() }
          <Route path={`/${prefix}acquisitions`} component={AcquisitionsContainer} />
          <Route path={`/${prefix}`} component={HomePageContainer} />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element
};

export default App;
