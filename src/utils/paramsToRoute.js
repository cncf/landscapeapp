import { stringifyUrl } from 'query-string'

const encodeZoom = ({ zoom }) => !zoom || zoom === 1 ? {} : { zoom: zoom * 100 }

const paramsToRoute = (params = {}) => {
  const { mainContentMode, selectedItemId, ...rest } = params
  const path = [
    mainContentMode === 'landscape' ? null : mainContentMode,
    selectedItemId ? 'items' : null,
    selectedItemId ? selectedItemId : null,
  ].filter(_ => _)
    .join('/')

  const query = {
    ...encodeZoom(rest)
  }

  // TODO: check if we can do shallow routing
  // TODO: see why forward slash is appended on empty route
  return stringifyUrl({ url: path ? `/${path}` : '', query })
}

export default paramsToRoute
