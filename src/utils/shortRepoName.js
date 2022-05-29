const shortRepoName = module.exports.shortRepoName = function(url) {
  if (!url) {
    return '';
  }
  if (url.indexOf('github') === -1) {
    return '';
  }
  return url.split('/').slice(3,5).join('/');
}
