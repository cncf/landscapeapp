import React, { Component } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import Head from './Head';
import App from './App';

export default class Root extends Component {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
          <ConnectedRouter history={history}>
            <Head />
            <App />
          </ConnectedRouter>
      </Provider>
    );
  }
}
