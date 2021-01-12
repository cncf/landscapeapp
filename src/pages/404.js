import { useEffect } from 'react'
import { useRouter } from 'next/router'

const NotFoundPage = ({ setError }) => {
  const router = useRouter()

  useEffect(() => {
    const message = `URL not found: ${window.location.href}`
    router.push('/')
    return () => setError(message)
  }, [])

  return <div>Redirecting...</div>
}

export default NotFoundPage
