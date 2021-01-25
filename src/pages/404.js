import { useEffect } from 'react'
import { useRouter } from 'next/router'
import convertLegacyUrl from '../utils/convertLegacyUrl'

const checkUrl = path => {
  if (path.indexOf('=') >= 0) {
    const redirectPath = convertLegacyUrl(path)
    const redirectUrl = `${location.origin}${redirectPath}`
    const message = <div>
      <style jsx>{`
        a {
          color: white;
          text-decoration: underline;
        }
      `}</style>
      URL deprecated. The following URL should be used instead:
      <div><a href={redirectUrl} target="_blank" rel="noopener noreferrer">{redirectUrl}</a></div>
    </div>
    const notice = { message, severity: 'warning' }
    return { redirectPath, notice }
  } else {
    const notice = { message: `URL not found: ${location.href}`, severity: 'error' }
    return { redirectPath: '/', notice }
  }
}

const NotFoundPage = ({ setNotice }) => {
  const router = useRouter()

  useEffect(() => {
    const path = router.asPath.split('?')[0]
    const { redirectPath, notice } = checkUrl(path)
    router.push(redirectPath)
    return () => setNotice(notice)
  }, [])

  return <div>Redirecting...</div>
}

export default NotFoundPage
