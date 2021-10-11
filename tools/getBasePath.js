const getBasePath = () => process.env.PROJECT_NAME ? `/${process.env.PROJECT_NAME}` : ''

module.exports = getBasePath
