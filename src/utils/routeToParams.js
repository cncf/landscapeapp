import { useRouter } from 'next/router'
import qs, { parseUrl } from 'query-string'
import settings from './settings'
import fields from '../types/fields'
import _ from 'lodash'

const defaultParams = {
  data: null,
  ready: false,
  initialUrlHandled: false,
  filters: {
    relation: [],
    stars: null,
    license: [],
    marketCap: null,
    organization: [],
    headquarters: [],
    landscape: [],
    bestPracticeBadgeId: null,
    enduser: null,
    googlebot: null,
    onlyModal: false,
    language: undefined, // null means no language
    parents: [],
  },
  grouping: 'relation',
  sortField: 'name',
  sortDirection: 'asc',
  selectedItemId: null,
  mainContentMode: settings.big_picture.main.url, // also landscape or serverless for a big picture
  cardMode: 'card', // one of card, logo, flat, borderless
  filtersVisible: false,
  zoom: 1,
  isFullscreen: false
};

function decodeField(name, value) {
  const field = fields[name]
  if (!field || !value) {
    return;
  }

  const parts = (value === 'true' ? 'yes' : value).split(',');
  const values = parts.map(function(part) {
    return _.find(field.values, function(x) {
      const v = x.url.toLowerCase();
      const p = part.toLowerCase();
      return v === p || decodeURIComponent(v) === p || qs.parse(decodeURIComponent(v)) === p;
    });
  }).filter(function(x) { return !!x}).map(function(x) {
    return x.id;
  });
  const processedValues = field.processValuesBeforeLoading(values);
  const parsedValue = field.isArray ? processedValues : processedValues[0];
  return _.isUndefined(value) ? null : parsedValue
}

const getRouterParams = _ => {
  const router = useRouter()
  const { path } = router.query
  const { query } = parseUrl(router.asPath)

  return { path, query }
}

const decodeMainContentMode = path => path && path[0] !== 'items' ? path[0] : 'landscape'

const decodeSelectedItemId = path => path && path.length >= 2 ? path[path.length - 1] : null

const decodeZoom = ({ zoom }) => zoom ? Math.trunc(+zoom) / 100 : 1

const decodeFullscreen = ({ fullscreen }) => fullscreen === 'yes' || fullscreen === 'true'

const decodeOrganization = organization => organization ? decodeField('organization', organization) : []

const routeToParams = params => {
  const { path, query } = params || getRouterParams()

  const filters = {
    ...defaultParams.filters,
    organization: decodeOrganization(query.organization)
  }

  return {
    defaultParams,
    mainContentMode: decodeMainContentMode(path),
    selectedItemId: decodeSelectedItemId(path),
    zoom: decodeZoom(query),
    isFullscreen: decodeFullscreen(query),
    filters
  }
}

export default routeToParams
