const { getBasePath } = require('../../tools/getBasePath');

const assetPath = module.exports.assetPath = path => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${getBasePath()}${path[0] === '/' ? '' : '/'}${path}`
}
