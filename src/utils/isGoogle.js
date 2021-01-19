// GoogleBot will have a user agent ending with bot.html, look at https://support.google.com/webmasters/answer/1061943?hl=en for more details
import isBrowser from './isBrowser'

// TODO: rework
const isGoogle = () => {
  if (!isBrowser()) {
    return false
  }

  return navigator.userAgent.indexOf('bot.html') !== -1 || window.location.href.indexOf('googlebot=yes') !== -1
}

export default isGoogle
