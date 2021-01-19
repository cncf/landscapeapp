const assetPath = path => {
  return `${process.env.basePath}${path[0] === '/' ? '' : '/'}${path}`
}

export default assetPath
