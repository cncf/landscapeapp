import isBrowser from './isBrowser'

export default () => isBrowser() && window.location.href.indexOf('only-modal=yes') !== -1

