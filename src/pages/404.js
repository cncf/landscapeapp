import { useEffect } from 'react'
import { useRouter } from 'next/router'
import convertLegacyUrl from '../utils/convertLegacyUrl'

const checkUrl = path => {
  if (path.indexOf('=') >= 0) {
    const notice = { message: `URL deprecated: ${location.href}`, severity: 'warning' }
    const redirectUrl = convertLegacyUrl(path)
    return { redirectUrl, notice }
  } else {
    const notice = { message: `URL not found: ${location.href}`, severity: 'error' }
    return { redirectUrl: '/', notice }
  }
}

const NotFoundPage = ({ setNotice }) => {
  const router = useRouter()

  useEffect(() => {
    const { redirectUrl, notice } = checkUrl(location.pathname)
    router.push(redirectUrl)
    return () => setNotice(notice)
  }, [])

  return <div>Redirecting...</div>
}

export default NotFoundPage
