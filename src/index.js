// Set up your application entry point here...
/* eslint-disable import/default */

import 'current-device';
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import configureStore, { history } from './store/configureStore';
import Root from './components/Root';
import {loadMainData} from './reducers/mainReducer.js';
import './styles/theme.scss';
import ReactGA from 'react-ga';
import isDesktop from './utils/isDesktop';
import iframeResizerContentWindow from 'iframe-resizer/js/iframeResizer.contentWindow';
console.info(iframeResizerContentWindow);
require('favicon.png'); // Tell webpack to load favicon.png
const store = configureStore();
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

import ps from 'project/settings.yml';
console.info('project settings via yaml loader', ps);

console.info(window.projectSettings);

import "./styles/roboto.css";
render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('app')
);
//Todo: move this to a better place
store.dispatch(loadMainData());

if (window.GA) {
  ReactGA.initialize(window.GA);
  ReactGA.pageview(window.location.pathname + window.location.search);
  history.listen(function(location) {
    ReactGA.pageview(location.pathname + window.location.search);
  });
}


if (module.hot) {
  module.hot.accept('./components/Root', () => {
    const NewRoot = require('./components/Root').default;
    render(
      <AppContainer>
        <NewRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('app')
    );
  });
}

// Event listener to determine change (horizontal/portrait)
if (!isDesktop) {
  window.addEventListener("orientationchange", updateOrientation);
  setInterval(updateOrientation, 1000);
}
function updateOrientation() {
  if (window.matchMedia("(orientation: portrait)").matches) {
    document.querySelector('html').classList.remove('landscape');
    document.querySelector('html').classList.add('portrait');
  } else {
    document.querySelector('html').classList.remove('portrait');
    document.querySelector('html').classList.add('landscape');
  }
}

