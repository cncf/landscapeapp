import React, { Component } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import App from './App';

export default class Root extends Component {
  render() {
    const { store, history } = this.props;
    // const ctx = React.createContext({store: store});
    return (
      <Provider store={store}>
          <ConnectedRouter history={history}>
            <div />
          </ConnectedRouter>
      </Provider>
    );
  }
}
