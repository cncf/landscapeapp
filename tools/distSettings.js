const port = process.env.PORT || '4000';
export const pathPrefix = process.env.PROJECT_NAME ? `/${process.env.PROJECT_NAME}` : ''
export const appUrl = `http://localhost:${port}${pathPrefix}`
