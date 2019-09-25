import path from 'path';
if (!process.env.PROJECT_PATH) {
  console.info('NOTE: the PROJECT_PATH env variable is not set. Please point it to the cncf, lfai or other landscape repo');
  process.env.PROJECT_PATH = path.resolve('../..');
  console.info('Using: ', process.env.PROJECT_PATH);
}
export const projectPath = process.env.PROJECT_PATH;
export const settings = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'settings.yml')));
