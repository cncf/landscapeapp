import path from 'path';
import { dump } from "./yaml";
import { readFileSync, writeFileSync } from "fs";
if (!process.env.PROJECT_PATH) {
  console.info('NOTE: the PROJECT_PATH env variable is not set. Please point it to the cncf, lfai or other landscape repo');
  process.env.PROJECT_PATH = path.resolve('../..');
  console.info('Using: ', process.env.PROJECT_PATH);
}
export const projectPath = process.env.PROJECT_PATH;
const settingsPath = path.resolve(projectPath, 'settings.yml');
export const settings = require('js-yaml').safeLoad(readFileSync(settingsPath));

export const saveSettings = (newSettings) => {
  writeFileSync(settingsPath, dump(newSettings));
}
