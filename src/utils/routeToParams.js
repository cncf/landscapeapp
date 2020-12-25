import { useRouter } from 'next/router'
import { parseUrl } from 'query-string'

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

const routeToParams = params => {
  const { path, query } = params || getRouterParams()

  return {
    mainContentMode: decodeMainContentMode(path),
    selectedItemId: decodeSelectedItemId(path),
    zoom: decodeZoom(query),
    isFullscreen: decodeFullscreen(query)
  }
}

export default routeToParams
