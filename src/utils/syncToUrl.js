import { initialState } from '../reducers/mainReducer';
import _ from 'lodash';
import qs from 'query-string';
import fields from '../types/fields';
import { options } from '../components/SortFieldContainer';
import isEmbed from './isEmbed';

import settings from '../utils/settings.js';
import { findLandscapeSettings } from './landscapeSettings';

export function filtersToUrl({filters, grouping, sortField, selectedItemId, zoom, mainContentMode = 'card-mode', cardMode = 'card', isFullscreen}) {
  // TODO: put back
  // const prefix = window.prefix;
  const prefix = ''
  const params = {};
  var fieldNames = _.keys(fields);

  if (isEmbed()) {
    params.embed = 'yes'
  }

  const filtersPart = qs.stringify(params, {encode: false})

  return [
    `/${mainContentMode === 'landscape' ? '' : mainContentMode}`,
    filtersPart
  ].filter(str => str).join('?')
}

export function parseUrl(url) {
  // TODO: put back
  // const prefix = window.prefix;
  const prefix = ''
  // TODO: parse old URL formats. Check Presets container
  const args = qs.parse(url.replace(prefix, ''));
  const newParameters = {
    filters: {

    }
  };
  var fieldNames = _.keys(fields);
  return newParameters;
}
