import { initialState } from '../reducers/mainReducer';
import _ from 'lodash';
import qs from 'query-string';
import fields from '../types/fields';
import { options } from '../components/SortFieldContainer';
import isEmbed from './isEmbed';
const sortOptions = options.map(function(x) {
  return {
    field: JSON.parse(x.id).field,
    direction: JSON.parse(x.id).direction
  }
});

import settings from 'project/settings.yml';
const mainSettings = settings.big_picture.main;
const extraSettings = settings.big_picture.extra || {};

export function addNoIndexIfRequired() {
  const url = window.location.pathname;
  if (url === '/' + window.prefix || (url.indexOf('/' + window.prefix + 'selected=') === 0 && url.indexOf('&') === -1)) {
    console.info('this can be indexed');
    const existingMeta = document.querySelector('meta[name="robots"]');
    if (existingMeta) {
      const head = document.getElementsByTagName('head')[0];
      head.removeChild(existingMeta);
    }
  } else {
    console.info('adding a no index meta tag for ', url);
    const existingMeta = document.querySelector('meta[name="robots"]');
    if (!existingMeta) {
      var link=document.createElement('meta');
      link.name='robots';
      link.content = 'noindex';
      const head = document.getElementsByTagName('head')[0];
      head.insertBefore(link, head.firstChild);
    }
  }
}

export function filtersToUrl({filters, grouping, sortField, selectedItemId, zoom, mainContentMode = 'card', isFullscreen}) {
  const prefix = window.prefix;
  const params = {};
  var fieldNames = _.keys(fields);
  _.each(fieldNames, function(field) {
    addFieldToParams({field: field, filters: filters, params: params});
  });
  addGroupingToParams({grouping: grouping, params: params});
  addSortFieldToParams({sortField: sortField, params: params});
  // addSortDirectionToParams({sortDirection: sortDirection, params: params});
  addSelectedItemIdToParams({selectedItemId: selectedItemId, params: params });
  addMainContentModeToParams({mainContentMode: mainContentMode, params: params});
  addZoomToParams({zoom: zoom, mainContentMode: mainContentMode, params: params});
  addFullscreenToParams({isFullscreen: isFullscreen, params: params});
  if (_.isEmpty(params)) {
    return `/${prefix}` + (isEmbed ? 'embed=yes' : '');
  }
  const filtersPart = qs.stringify(params, {encode: false}) + (isEmbed ? '&embed=yes':'');

  return `/${prefix}` + filtersPart;
}
export function parseUrl(url) {
  const prefix = window.prefix;
  const args = qs.parse(url.replace(prefix, ''));
  const newParameters = {
    filters: {

    }
  };
  var fieldNames = _.keys(fields);
  _.each(fieldNames, function(field) {
    setFieldFromParams({
      field: field,
      params: args,
      filters: newParameters.filters
    });
  });
  setGroupingFromParams({newParameters, params: args });
  setSortFieldFromParams({newParameters, params: args });
  // setSortDirectionFromParams({newParameters, params: args });
  if (newParameters.sortField) {
    var sortOption = _.find(sortOptions, {field: newParameters.sortField});
    if (sortOption) {
      newParameters.sortDirection = sortOption.direction;
    }
  }
  setSelectedItemIdFromParams({newParameters, params: args });
  setMainContentModeFromParams({newParameters, params: args });
  setZoomFromParams({newParameters, params: args });
  setFullscreenFromParams({newParameters, params: args});
  return newParameters;
}

function addFieldToParams({field, filters, params}) {
  var value = filters[field];
  const fieldInfo = fields[field];
  if (_.isUndefined(value)) {
    return;
  }
  if (JSON.stringify(value) !== JSON.stringify(initialState.filters[field])) {
    if (!_.isArray(value)) {
      value = [value];
    }
    const processedValues = fieldInfo.processValuesBeforeSaving(value);
    const urlValues = processedValues.map(function(v){
      const valueInfo = _.find(fieldInfo.values, {id: v});
      return valueInfo.url
    });
    params[fieldInfo.url] = urlValues.join(',');
  }
}
function addGroupingToParams({grouping, params}) {
  const value = grouping;
  if (_.isUndefined(value)) {
    return;
  }
  if (value !== initialState.grouping) {
    const fieldInfo = fields[value];
    if (grouping === 'no') {
      params['grouping'] = 'no';
    } else {
      params['grouping'] = fieldInfo.url;
    }
  }
}
function addSortFieldToParams({sortField, params}) {
  const value = sortField;
  if (_.isUndefined(value)) {
    return;
  }
  if (value !== initialState.sortField) {
    const fieldInfo = fields[value];
    params['sort'] = fieldInfo.url;
  }
}

function addMainContentModeToParams({mainContentMode, params}) {
  if (mainContentMode !== initialState.mainContentMode) {
    if (mainContentMode === mainSettings.url) {
      params['format'] = mainSettings.url;
    }
    if (mainContentMode === extraSettings.url && extraSettings.url) {
      params['format'] = extraSettings.url;
    }
    if (mainContentMode === 'card') {
      params['format'] = 'card-mode'
    }
  }
}

function addZoomToParams({zoom, mainContentMode, params}) {
  if (zoom && zoom !== initialState.zoom && mainContentMode !== 'card') {
    params['zoom'] = zoom * 100;
  }
}

function addFullscreenToParams({isFullscreen, params}) {
  if (isFullscreen === true) {
    params['fullscreen'] = 'yes';
  }
}

function addSelectedItemIdToParams({selectedItemId, params}) {
  const value = selectedItemId;
  if (_.isUndefined(value)) {
    return;
  }
  if (value !== initialState.selectedItemId) {
    params['selected'] = value;
  }
}

function setFieldFromParams({field, filters, params}) {
  const fieldInfo = fields[field];
  if (!fieldInfo) {
    return;
  }
  const urlValue = params[fieldInfo.url];
  if (!urlValue) {
    return;
  }
  const parts = urlValue.split(',');
  const values = parts.map(function(part) {
    return _.find(fieldInfo.values, function(x) {
      return x.url.toLowerCase() === part.toLowerCase();
    });
  }).filter(function(x) { return !!x}).map(function(x) {
    return x.id;
  });
  const processedValues = fieldInfo.processValuesBeforeLoading(values);
  const value = fieldInfo.isArray ? processedValues : processedValues[0];
  if (!_.isUndefined(value)) {
    filters[field] = value;
  }
}
function setGroupingFromParams({ newParameters, params}) {
  const urlValue = params.grouping;
  if (!urlValue) {
    return;
  }
  if (urlValue === 'no') {
    newParameters.grouping = 'no'
  } else {
    const fieldInfo =  _.find(_.values(fields), function(x) {
      return x.url.toLowerCase() === urlValue.toLowerCase();
    });
    if (!_.isUndefined(fieldInfo)) {
      newParameters.grouping = fieldInfo.id;
    }
  }
}
function setSortFieldFromParams({ newParameters, params}) {
  const urlValue = params.sort;
  if (!urlValue) {
    return;
  }
    const fieldInfo =  _.find(_.values(fields), function(x) {
      return x.url.toLowerCase() === urlValue.toLowerCase();
    });
  if (!_.isUndefined(fieldInfo)) {
    newParameters.sortField = fieldInfo.id;
  }
}
function setMainContentModeFromParams({ newParameters, params}) {
  const format = params.format;
  if (!format) {
    newParameters.mainContentMode = mainSettings.url;
  } else if (format === extraSettings.url && extraSettings.url) {
    newParameters.mainContentMode = extraSettings.url;
  } else if (format === 'card-mode') {
    newParameters.mainContentMode = 'card';
  }
}

function setZoomFromParams({ newParameters, params}) {
  const zoom = params.zoom;
  if (!zoom) {
    // newParameters.zoom = 1.0;
  } else {
    const zoomAsValue = Math.trunc(+params.zoom) / 100;
    newParameters.zoom = zoomAsValue;
  }
}

function setFullscreenFromParams({ newParameters, params}) {
  newParameters.isFullscreen = params.fullscreen === 'yes' || params.fullscreen === 'true';
}

  /*
function setSortDirectionFromParams({ newParameters, params}) {
  const urlValue = params.sortField;
  if (!urlValue) {
    return;
  }
  const options = ['asc', 'desc'];
  const sortDirection =  _.find(options, function(x) {
    return x.toLowerCase() === urlValue.toLowerCase();
  });
  if (!_.isUndefined(sortDirection)) {
    newParameters.sortDirection = sortDirection;
  }
}
*/

function setSelectedItemIdFromParams({ newParameters, params}) {
  const urlValue = params.selected;
  if (!urlValue) {
    return;
  }
  newParameters.selectedItemId = urlValue;
}
