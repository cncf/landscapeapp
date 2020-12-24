import { useRouter } from 'next/router'

const getRouterParams = _ => {
  const router = useRouter()
  return router.query
}

const routeToParams = params => {
  const { path } = params || getRouterParams()

  const mainContentMode = path && path[0] !== 'items' ? path[0] : 'landscape'
  const selectedItemId = path && path.length >= 2 ? path[path.length - 1] : null

  return { mainContentMode, selectedItemId }
}

export default routeToParams
