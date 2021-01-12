import qs  from 'query-string'
import fields from '../types/fields'
import { sortOptions } from '../types/fields'

const defaultParams = {
  data: null,
  ready: false,
  initialUrlHandled: false,
  filters: {
    relation: [],
    stars: null,
    license: [],
    organization: [],
    headquarters: [],
    landscape: [],
    bestPracticeBadgeId: null,
    enduser: null,
    language: undefined, // null means no language
    parents: [],
  },
  grouping: 'relation',
  sortField: 'name',
  sortDirection: 'asc',
  selectedItemId: null,
  zoom: 1,
  isFullscreen: false
};

function decodeField(field, value) {
  if (!field || !value) {
    return;
  }

  const parts = (value === 'true' ? 'yes' : value).split(',');
  const values = parts.map(part => {
    return field.values.find(option => {
      const v = option.url.toLowerCase();
      const p = part.toLowerCase();
      return v === p || decodeURIComponent(v) === p || qs.parse(decodeURIComponent(v)) === p;
    });
  }).filter(_ => _)
    .map(({ id }) => id)

  const processedValues = field.processValuesBeforeLoading(values);

  return field.isArray ? processedValues : processedValues[0]
}

const getField = urlValue => {
  if (!urlValue) {
    return
  }

  const field = Object.values(fields).find(({ url }) => url.toLowerCase() === urlValue.toLowerCase())

  return field ? field.id : null
}

const decodeZoom = ({ zoom }) => zoom ? Math.trunc(+zoom) / 100 : 1

const decodeGrouping = grouping => grouping === 'no' ? grouping : getField(grouping) || 'relation'

const decodeCardStyle = style => style || 'card'

const decodeSort = sort => {
  const sortField = getField(sort) || 'name'
  const option = sortOptions.find(option => option.id === sortField)
  const sortDirection = option ? option.direction : 'asc'

  return { sortField, sortDirection}
}

const decodeBoolean = value => value === 'yes' || value === 'true'

const routeToParams = ({ mainContentMode, ...query }) => {
  const fieldFilters = Object.entries(fields).reduce((result, [key, field]) => {
    const param = field.url || field.id
    const value = query[param]
    const parsedValue = decodeField(field, value)
    return { ...result, [key]: parsedValue || parsedValue === false ? parsedValue : defaultParams.filters[key] }
  }, {})

  const filters = {
    ...defaultParams.filters,
    ...fieldFilters
  }

  return {
    mainContentMode,
    selectedItemId: query.selected,
    zoom: decodeZoom(query),
    isFullscreen: decodeBoolean(query.fullscreen),
    grouping: decodeGrouping(query.grouping),
    cardStyle: decodeCardStyle(query.style),
    isEmbed: decodeBoolean(query.embed),
    onlyModal: decodeBoolean(query['only-modal']),
    ...decodeSort(query.sort),
    filters
  }
}

export default routeToParams
