import { useEffect, useState } from 'react'

const mockCurrentDevice = {
  ios: () => false,
  desktop: () => true,
  landscape: () => true,
  ready: false
}

const useCurrentDevice = () => {
  const [currentDevice, setCurrentDevice] = useState(mockCurrentDevice)

  useEffect(() => {
    const device = require('current-device').default
    setCurrentDevice({ ...device, ready: true })
  }, [])

  return currentDevice
}

export default useCurrentDevice
