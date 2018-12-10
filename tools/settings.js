import path from 'path';
export const projectPath = process.env.PROJECT_PATH;
if (!projectPath) {
  console.info('FATAL: the PROJECT_PATH env variable is not set. Please point it to the cncf, lfdl or other landscape repo');
  console.info(process.env);
  process.exit(1);
}
export const settings = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'settings.yml')));
