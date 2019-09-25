import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';

import createSelector from '../utils/createSelector';
import { parseUrl } from '../utils/syncToUrl';
import { changeParameters} from '../reducers/mainReducer';

const getParameters = createSelector(
  (state) => state.router.location.pathname.split('/').slice(-1)[0],
  function(part) {
    return parseUrl(part);
  }
);

const mapStateToProps = (state) => ({
  info: getParameters(state),
});
const mapDispatchToProps = {
  changeParameters: changeParameters
};


const render = ({info, changeParameters}) => {
  // if we are here - url has changed
  // otherwise everything is cached
  window.setTimeout(() => changeParameters(info), 1);
  return <div/>;
}


export default connect(mapStateToProps, mapDispatchToProps)(pure(render));
