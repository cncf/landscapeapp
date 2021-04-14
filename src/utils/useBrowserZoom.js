import { useEffect, useState } from 'react'
import useCurrentDevice from './useCurrentDevice'


const useBrowserZoom = () => {
  const currentDevice = useCurrentDevice()
  const [zoomedIn, setZoomedIn] = useState(false)

  useEffect(() => {
    const checkZoomedIn = () => {
      // This method actually checks if there's zoom on mobile device
      // so it returns false for desktop browsers.
      const { visualViewport } = window
      const zoomedIn = !currentDevice.desktop() && visualViewport && visualViewport.scale > 1
      setZoomedIn(zoomedIn)
    }
    window.addEventListener('touchend', checkZoomedIn)
    return () => window.removeEventListener('touchend', checkZoomedIn)
  }, [])

  return zoomedIn
}

export default useBrowserZoom
