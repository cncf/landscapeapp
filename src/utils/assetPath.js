import getBasePath from '../../tools/getBasePath'

const assetPath = path => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${getBasePath()}${path[0] === '/' ? '' : '/'}${path}`
}

export default assetPath
