import qs, { stringifyUrl } from 'query-string'
import fields, { sortOptions } from '../types/fields'
import { isArray } from 'lodash'

const defaultSort = 'name'
const defaultGrouping = 'relation'

const compact = obj => {
  return Object.entries(obj).reduce((result, [key, value]) => {
    return { ...result, ...(value ? { [key]: value } : {})}
  }, {})
}

const getField = urlValue => {
  if (!urlValue) {
    return
  }

  const field = Object.values(fields).find(({ url }) => url.toLowerCase() === urlValue.toLowerCase())

  return field ? field.id : null
}

const stringifyField = (field, value) => {
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

function parseField(field, value) {
  if (!value) {
    return field.isArray ? [] : null;
  }

  const parts = (value === 'true' ? 'yes' : value).split(',');
  const values = parts.map(part => {
    return field.values.find(option => {
      const v = option.url.toLowerCase();
      const p = part.toLowerCase();
      return v === p || encodeURIComponent(v) === p || qs.parse(encodeURIComponent(v)) === p;
    });
  }).filter(_ => _)
    .map(({ id }) => id)

  const processedValues = field.processValuesBeforeLoading(values);

  return field.isArray ? processedValues : processedValues[0]
}

const stringifyZoom = zoom => zoom && zoom !== 1 ? zoom * 100 : null

const parseZoom = ({ zoom }) => zoom ? Math.trunc(+zoom) / 100 : 1

const stringifyFullscreen = isFullscreen => isFullscreen ? 'yes' : null

const stringifyGrouping = grouping => {
  if (grouping && grouping !== defaultGrouping) {
    return grouping === 'no' ? 'no' : fields[grouping].url
  }
}

const parseGrouping = function(grouping) {
  return grouping === 'no' ? grouping : getField(grouping) || defaultGrouping
}

const stringifyCardStyle = style => style !== 'card' ? style : null

const parseCardStyle = style => style || 'card'

const stringifyEmbed = isEmbed => isEmbed ? 'yes' : null

const parseSort = sort => {
  const sortField = getField(sort) || defaultSort
  const option = sortOptions.find(option => option.id === sortField)
  const sortDirection = option ? option.direction : 'asc'

  return { sortField, sortDirection}
}

const stringifySort = sort => sort && sort !== defaultSort ? sort : null

const parseBoolean = value => value === 'yes' || value === 'true'

const stringifyParams = (params = {}) => {
  const { mainContentMode, selectedItemId, ...rest } = params
  const path = [
    mainContentMode === 'landscape' ? null : mainContentMode,
  ].filter(_ => _)
    .join('/')

  const filterParams = rest.filters || {}

  const fieldFilters = Object.entries(fields).reduce((result, [key, field]) => {
    const value = filterParams[key]
    const param = field.url || field.id
    return { ...result, [param]: stringifyField(field, value) }
  }, {})

  const filters = compact({
    ...fieldFilters
  })

  const query = compact({
    selected: selectedItemId,
    zoom: stringifyZoom(rest.zoom),
    fullscreen: stringifyFullscreen(rest.isFullscreen),
    grouping: stringifyGrouping(rest.grouping),
    sort: stringifySort(rest.sortField),
    style: stringifyCardStyle(rest.cardStyle),
    embed: stringifyEmbed(rest.isEmbed),
    ...filters
  })

  return stringifyUrl({ url: `/${path}`, query },
    { arrayFormat: 'comma', skipNull: true, skipEmptyString: true })
}

const parseParams = (query) => {
  if (typeof query === 'string') {
    query = Object.fromEntries(new URLSearchParams(query));
  }
  const filters = Object.entries(fields).reduce((result, [key, field]) => {
    const param = field.url || field.id
    const value = query[param]
    const parsedValue = parseField(field, value)
    return { ...result, [key]: parsedValue }
  }, {})

  return {
    selectedItemId: query.selected,
    zoom: parseZoom(query),
    isFullscreen: parseBoolean(query.fullscreen),
    grouping: parseGrouping(query.grouping),
    cardStyle: parseCardStyle(query.style),
    isEmbed: parseBoolean(query.embed),
    onlyModal: parseBoolean(query['only-modal']),
    ...parseSort(query.sort),
    filters
  }
}

export { stringifyParams, parseParams }
