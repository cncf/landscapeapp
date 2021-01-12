import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { parse, stringify } from 'querystring'

const checkUrl = () => {
  const pathname = location.pathname.replace(/^\//, '')
  if (pathname.indexOf('=') >= 0) {
    const notice = { message: `URL deprecated: ${window.location.href}`, severity: 'warning' }
    const { format, ...rest } = parse(pathname)
    const path = `/${format}`
    const query = stringify(rest)
    const redirectUrl = [path, query].filter(_ => _).join('?')
    return { redirectUrl, notice }
  } else {
    const notice = { message: `URL not found: ${window.location.href}`, severity: 'error' }
    return { redirectUrl: '/', notice }
  }
}

const NotFoundPage = ({ setNotice }) => {
  const router = useRouter()

  useEffect(() => {
    const { redirectUrl, notice } = checkUrl()
    router.push(redirectUrl)
    return () => setNotice(notice)
  }, [])

  return <div>Redirecting...</div>
}

export default NotFoundPage
