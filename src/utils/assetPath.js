const { getBasePath } = require('../../tools/getBasePath');

module.exports.assetPath = path => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${getBasePath()}${path[0] === '/' ? '' : '/'}${path}`
}
