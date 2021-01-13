import { useEffect, useState } from 'react'

const mockCurrentDevice = {
  ios: () => false,
  desktop: () => true,
  landscape: () => true
}

const useCurrentDevice = () => {
  const [currentDevice, setCurrentDevice] = useState(mockCurrentDevice)

  useEffect(() => {
    setCurrentDevice(require('current-device').default)
  }, [])

  return currentDevice
}

export default useCurrentDevice
