/* eslint-disable import/no-named-as-default */
import React from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Switch, Route } from 'react-router-dom';

import { MainFullscreenLandscapeContainer, ExtraFullscreenLandscapeContainer, ThirdFullscreenLandscapeContainer } from "./BigPicture";
import HomePageContainer from './HomePageContainer';
import NotFoundPage from './NotFoundPage';
import settings from 'project/settings.yml';
const mainSettings = settings.big_picture.main;
const extraSettings = settings.big_picture.extra;
const thirdSettings = settings.big_picture.third;

// detect an initial prefix, like /cncf/ or /lfdl/ , but it can be just /
const possiblePrefix = window.possiblePrefix || '';
const prefix = (possiblePrefix && location.pathname.indexOf(possiblePrefix) === 1) ? (possiblePrefix + '/') : '';
window.prefix = prefix;

// This is a class-based component because the current
// version of hot reloading won't hot reload a stateless
// component at the top-level.
class App extends React.Component {
  render() {
    return (
      <div>
        <CssBaseline />
        <Switch>
          <Route exact path={`/${prefix}`} component={HomePageContainer} />
          { extraSettings && <Route exact path={`/${prefix}${extraSettings.url}`} component={ExtraFullscreenLandscapeContainer}/> }
          { thirdSettings && <Route exact path={`/${prefix}${thirdSettings.url}`} component={ThirdFullscreenLandscapeContainer}/> }
          <Route exact path={`/${prefix}${mainSettings.url}`} component={MainFullscreenLandscapeContainer}/>
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
