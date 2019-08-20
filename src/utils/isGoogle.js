
// GoogleBot will have a user agent ending with bot.html, look at https://support.google.com/webmasters/answer/1061943?hl=en for more details
const googlebotUA = navigator.userAgent.indexOf('bot.html') !== -1;
const googlebotInQuery = window.location.href.indexOf('googlebot=yes') !== -1;
export default googlebotUA || googlebotInQuery;
