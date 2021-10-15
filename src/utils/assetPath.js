import getBasePath from '../../tools/getBasePath'

const assetPath = path => {
  return `${getBasePath()}${path[0] === '/' ? '' : '/'}${path}`
}

export default assetPath
