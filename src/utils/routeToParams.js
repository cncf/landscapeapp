import { useRouter } from 'next/router'
import qs, { parseUrl } from 'query-string'
import settings from './settings'
import fields from '../types/fields'
import { options } from '../components/SortFieldContainer'

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
  mainContentMode: settings.big_picture.main.url, // also landscape or serverless for a big picture
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

const getRouterParams = _ => {
  const router = useRouter()
  const { path } = router.query
  const { query } = parseUrl(router.asPath)

  return { path, query }
}

const decodeReallyFullscreen = path => path && path[path.length - 1] === 'fullscreen'

const decodeMainContentMode = (path, tab) => {
  return path && path[0] !== 'items' && path[0] !== 'fullscreen' ? path[0] : tab || 'landscape'
}

const decodeSelectedItemId = path => path && path[0] === 'items' ? path[1] : null

const decodeZoom = ({ zoom }) => zoom ? Math.trunc(+zoom) / 100 : 1

const decodeFullscreen = ({ fullscreen }) => fullscreen === 'yes' || fullscreen === 'true'

const decodeGrouping = grouping => grouping === 'no' ? grouping : getField(grouping) || 'relation'

const decodeCardStyle = style => style || 'card'

const decodeEmbed = embed => embed === 'yes' || embed === 'true'

const decodeSort = sort => {
  const sortField = getField(sort) || 'name'
  const option = options.find(option => option.id === sortField)
  const sortDirection = option ? option.direction : 'asc'

  return { sortField, sortDirection}
}

const routeToParams = params => {
  const { path, query } = params || getRouterParams()

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
    defaultParams,
    mainContentMode: decodeMainContentMode(path, query.tab),
    selectedItemId: decodeSelectedItemId(path),
    // TODO: come up with better naming
    isReallyFullscreen: decodeReallyFullscreen(path),
    zoom: decodeZoom(query),
    isFullscreen: decodeFullscreen(query),
    grouping: decodeGrouping(query.grouping),
    cardStyle: decodeCardStyle(query.style),
    isEmbed: decodeEmbed(query.embed),
    ...decodeSort(query.sort),
    filters
  }
}

export default routeToParams
