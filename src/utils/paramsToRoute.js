import { stringifyUrl } from 'query-string'
import fields from '../types/fields'
import { isArray } from 'lodash'

const encodeField = (name, value) => {
  const field = fields[name]
  if (!value || value.length === 0) {
    return {};
  }

  const processedValues = field.processValuesBeforeSaving(isArray ? value : [value])
  const urlValues = processedValues.map(v => {
    const valueInfo = field.values.find(({ id }) => id === v)
    return valueInfo.url
  });

  return urlValues.length > 0 ? { [field.url]: urlValues.join(',') } : null
}

const encodeZoom = zoom => !zoom || zoom === 1 ? {} : { zoom: zoom * 100 }

const encodeFullscreen = isFullscreen => isFullscreen ? { fullscreen: 'yes' } : null

const paramsToRoute = (params = {}) => {
  const { mainContentMode, selectedItemId, ...rest } = params
  const path = [
    mainContentMode === 'landscape' ? null : mainContentMode,
    selectedItemId ? 'items' : null,
    selectedItemId ? selectedItemId : null,
  ].filter(_ => _)
    .join('/')

  const filterParams = rest.filters || {}

  const filters = {
    ...encodeField('organization', filterParams.organization)
  }

  const query = {
    ...encodeZoom(rest.zoom),
    ...encodeFullscreen(rest.isFullscreen),
    ...filters
  }

  // TODO: check if we can do shallow routing
  // TODO: see why forward slash is appended on empty route
  return stringifyUrl({ url: path ? `/${path}` : '', query })
}

export default paramsToRoute
