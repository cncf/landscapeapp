import isBrowser from './isBrowser'

const mockCurrentDevice = {
  ios: () => false,
  desktop: () => true,
  landscape: () => true
}

const currentDevice = isBrowser() ? require('current-device').default : mockCurrentDevice
export default currentDevice

