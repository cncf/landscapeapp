// Set up your application entry point here...
/* eslint-disable import/default */

import 'current-device';
import 'babel-polyfill';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import configureStore, { history } from './store/configureStore';
import Root from './components/Root';
import {loadMainData} from './reducers/mainReducer.js';
import { loadData } from './reducers/api.js';
import './styles/theme.scss';
import ReactGA from 'react-ga';
import isDesktop from './utils/isDesktop';
import iframeResizerContentWindow from 'iframe-resizer/js/iframeResizer.contentWindow';
require('favicon.png'); // Tell webpack to load favicon.png
import "./styles/roboto.css";

async function main() {
  // redux + react-snap specific hacks
  const rootElement = document.getElementById("app");
  const isPrerendered = rootElement.hasChildNodes();
  const isPrerendering = navigator.userAgent === "ReactSnap";
  if (isPrerendering) {
    document.querySelector('html').classList.add('react-snap');
  }


  const preloadedState = window.__PRELOADED_STATE__;
  delete window.__PRELOADED_STATE__;
  let store;
  // Tell react-snap how to save Redux state, plus remove extra features
  window.snapSaveState = function() {
    console.info('state');
    const state = store.getState();
    console.info('state');
    delete state.main.data;

    return {
      __PRELOADED_STATE__: state
    };
  }

  window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

  if (isPrerendered) {
    const data = await loadData();
    preloadedState.main.data = data;
    preloadedState.router.location.pathname = window.location.pathname;
    store = configureStore(preloadedState);
    hydrate(
      <AppContainer>
        <Root store={store} history={history} />
      </AppContainer>,
      document.getElementById('app')
    );
    document.querySelector('html').classList.remove('react-snap');
  } else {
    console.info('1');
    store = configureStore();
    render(
      <AppContainer>
        <Root store={store} history={history} />
      </AppContainer>,
      document.getElementById('app')
    );
    console.info('2');
    store.dispatch(loadMainData());
    console.info('3');
  }

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
}
main().catch(function(ex) {
  throw ex;
});

