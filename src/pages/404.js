import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { parse, stringify } from 'querystring'

const checkUrl = () => {
  const pathname = location.pathname.replace(/^\//, '')
  if (pathname.indexOf('=') >= 0) {
    const notice = `URL deprecated: ${window.location.href}`
    const { format, ...rest } = parse(pathname)
    const path = `/${format}`
    const query = stringify(rest)
    const redirectUrl = [path, query].filter(_ => _).join('?')
    return { redirectUrl, notice }
  } else {
    const notice = `URL not found: ${window.location.href}`
    return { redirectUrl: '/', notice }
  }
}

const NotFoundPage = ({ setError }) => {
  const router = useRouter()

  useEffect(() => {
    const { redirectUrl, notice } = checkUrl()
    router.push(redirectUrl)
    return () => setError(notice)
  }, [])

  return <div>Redirecting...</div>
}

export default NotFoundPage
