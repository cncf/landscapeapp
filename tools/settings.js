import path from 'path';
import { dump } from "./yaml";
import { readFileSync, writeFileSync } from "fs";
if (!process.env.PROJECT_PATH) {
  console.info('ERROR: the PROJECT_PATH env variable is not set. Please point it to the cncf, lfai or other landscape repo');
  process.exit(1);
}
export const projectPath = process.env.PROJECT_PATH;
const settingsPath = path.resolve(projectPath, 'settings.yml');
export const settings = require('js-yaml').load(readFileSync(settingsPath));

export const saveSettings = (newSettings) => {
  writeFileSync(settingsPath, dump(newSettings));
}
