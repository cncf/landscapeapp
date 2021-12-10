import { useEffect, useState } from 'react'

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ innerWidth: 1050, innerHeight: 600 })

  useEffect(() => {
    const onResize = () => setWindowSize({ innerWidth, innerHeight })
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return windowSize
}

export default useWindowSize
