import { stringifyUrl } from 'query-string'
import fields from '../types/fields'
import { isArray } from 'lodash'

const compact = obj => {
  return Object.entries(obj).reduce((result, [key, value]) => {
    return { ...result, ...(value ? { [key]: value } : {})}
  }, {})
}

const encodeField = (field, value) => {
  if (value === null || value === undefined || isArray(value) && value.length === 0) {
    return null;
  }

  const processedValues = field.processValuesBeforeSaving(isArray(value) ? value : [value])
  const urlValues = processedValues.map(v => {
    const valueInfo = field.values.find(({ id }) => id === v)
    return valueInfo.url
  });

  return urlValues ? urlValues : null
}

const encodeZoom = zoom => zoom && zoom !== 1 ? zoom * 100 : null

const encodeFullscreen = isFullscreen => isFullscreen ? 'yes' : null

const encodeGrouping = grouping => grouping === 'no' ? 'no' : fields[grouping].url

const encodeCardStyle = style => style !== 'card' ? style : null

const paramsToRoute = (params = {}) => {
  const { mainContentMode, selectedItemId, ...rest } = params
  const path = [
    mainContentMode === 'landscape' ? null : mainContentMode,
    selectedItemId ? 'items' : null,
    selectedItemId ? selectedItemId : null,
  ].filter(_ => _)
    .join('/')

  const filterParams = rest.filters || {}

  const fieldFilters = Object.entries(fields).reduce((result, [key, field]) => {
    const value = filterParams[key]
    const param = field.url || field.id
    return { ...result, [param]: encodeField(field, value) }
  }, {})

  const filters = compact({
    ...fieldFilters
  })

  const query = compact({
    zoom: encodeZoom(rest.zoom),
    fullscreen: encodeFullscreen(rest.isFullscreen),
    grouping: encodeGrouping(rest.grouping),
    sort: rest.sortField,
    style: encodeCardStyle(rest.cardStyle),
    ...filters
  })

  // TODO: check if we can do shallow routing
  // TODO: see why forward slash is appended on empty route
  // TODO: check if it's possible to not encode comma
  return stringifyUrl({ url: path ? `/${path}` : '', query },
    { arrayFormat: 'comma', skipNull: true, skipEmptyString: true })
}

export default paramsToRoute
