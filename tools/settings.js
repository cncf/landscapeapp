const { readFileSync, writeFileSync } = require("fs");
const path = require('path');
const { dump } = require("./yaml");

if (!process.env.PROJECT_PATH) {
  console.info('ERROR: the PROJECT_PATH env variable is not set. Please point it to the cncf, lfai or other landscape repo');
  process.exit(1);
}

const projectPath = process.env.PROJECT_PATH;
const distPath = path.resolve(projectPath, 'dist', process.env.PROJECT_NAME || '');
const settingsPath = path.resolve(projectPath, 'settings.yml');
const settings = require('js-yaml').load(readFileSync(settingsPath));
const basePath = process.env.PROJECT_NAME ? '/' + process.env.PROJECT_NAME : '';
const saveSettings = (newSettings) => {
  writeFileSync(settingsPath, dump(newSettings));
}

module.exports = { projectPath, distPath, settingsPath, settings, basePath, saveSettings };
