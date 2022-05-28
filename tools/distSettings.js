const port = process.env.PORT || '4000';
const pathPrefix = module.exports.pathPrefix = process.env.PROJECT_NAME ? `/${process.env.PROJECT_NAME}` : '';
const appUrl = module.exports.appUrl = `http://localhost:${port}${pathPrefix}`;
