import isBrowser from './isBrowser'

const isEmbed = () => {
  if (!isBrowser()) {
    return false
  }
  const { pathname } = window.location
  return pathname.indexOf('embed=true') !== -1 || pathname.indexOf('embed=yes') !== -1;
}

export default isEmbed;
