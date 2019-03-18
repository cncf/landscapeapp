import _ from 'lodash';
export default function actualTwitter(node, crunchbaseEntry) {
  const url = (function() {
      if (_.isUndefined(node.twitter)) {
        return (crunchbaseEntry || {}).twitter;
      }
      return node.twitter;
  })();
  if (_.isEmpty(url)) {
    return null;
  }
  const fixedUrl = (function() {
    if (url.indexOf('http://twitter.com/') === 0) {
      return url.replace('http://twitter.com/', 'https://twitter.com/');
    }
    if (url.indexOf('https://www.twitter.com/') === 0) {
      return url.replace('https://www.twitter.com/', 'https://twitter.com/');
    }
    if (url.indexOf('http://twitter.com/') === 0) {
      return url.replace('http://twitter.com/', 'https://twitter.com/');
    }
    return url;
  })();
  return fixedUrl;
}
