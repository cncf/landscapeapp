const basePath = process.env.PROJECT_NAME ? `/${process.env.PROJECT_NAME}` : ''

const assetPath = path => {
  return `${basePath || ''}${path[0] === '/' ? '' : '/'}${path}`
}

export default assetPath
