import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import mainReducer from './mainReducer';

export default (history) => combineReducers({
  main: mainReducer,
  router: connectRouter(history)
});
