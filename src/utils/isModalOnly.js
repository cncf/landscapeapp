import isBrowser from './isBrowser'

const isModalOnly = () => isBrowser() && window.location.href.indexOf('only-modal=yes') !== -1

export default isModalOnly

