import isBrowser from './isBrowser'

export default () => isBrowser() && window.location.pathname.indexOf('only-modal=yes') !== -1

