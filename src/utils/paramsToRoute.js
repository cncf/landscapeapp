import { stringifyUrl } from 'query-string'
import fields from '../types/fields'
import { isArray } from 'lodash'

const compact = obj => {
  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key]
    return { ...result, ...(value ? { [key]: value } : {})}
  }, {})
}

const encodeField = (name, value) => {
  const field = fields[name]
  if (!value || value.length === 0) {
    return null;
  }

  const processedValues = field.processValuesBeforeSaving(isArray ? value : [value])
  const urlValues = processedValues.map(v => {
    const valueInfo = field.values.find(({ id }) => id === v)
    return valueInfo.url
  });

  return urlValues.join(',')
}

const encodeZoom = zoom => zoom && zoom !== 1 ? zoom * 100 : null

const encodeFullscreen = isFullscreen => isFullscreen ? 'yes' : null

const paramsToRoute = (params = {}) => {
  const { mainContentMode, selectedItemId, ...rest } = params
  const path = [
    mainContentMode === 'landscape' ? null : mainContentMode,
    selectedItemId ? 'items' : null,
    selectedItemId ? selectedItemId : null,
  ].filter(_ => _)
    .join('/')

  const filterParams = rest.filters || {}

  const filters = compact({
    organization: encodeField('organization', filterParams.organization)
  })

  const query = compact({
    zoom: encodeZoom(rest.zoom),
    fullscreen: encodeFullscreen(rest.isFullscreen),
    ...filters
  })

  // TODO: check if we can do shallow routing
  // TODO: see why forward slash is appended on empty route
  return stringifyUrl({ url: path ? `/${path}` : '', query })
}

export default paramsToRoute
