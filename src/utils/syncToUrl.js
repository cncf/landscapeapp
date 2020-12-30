import { initialState } from '../reducers/mainReducer';
import _ from 'lodash';
import qs from 'query-string';
import fields from '../types/fields';
import { options } from '../components/SortFieldContainer';

import settings from '../utils/settings.js';
import { findLandscapeSettings } from './landscapeSettings';

// TODO: remove
export function filtersToUrl({filters, grouping, sortField, selectedItemId, zoom, mainContentMode = 'card-mode', cardMode = 'card', isFullscreen}) {
  const params = {};
  var fieldNames = _.keys(fields);

  const filtersPart = qs.stringify(params, {encode: false})

  return [
    `/${mainContentMode === 'landscape' ? '' : mainContentMode}`,
    filtersPart
  ].filter(str => str).join('?')
}

export function parseUrl(url) {
  // TODO: parse old URL formats. Check Presets container
  const newParameters = {
    filters: {

    }
  };
  var fieldNames = _.keys(fields);
  return newParameters;
}
