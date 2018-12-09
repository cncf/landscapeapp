import path from 'path';
export const projectPath = process.env.PROJECT_PATH;
export const settings = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'settings.yml')));
