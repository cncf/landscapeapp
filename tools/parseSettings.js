import path from 'path'
import { safeLoad } from 'js-yaml'
import { readFileSync, writeFileSync } from "fs";
const projectPath = process.env.PROJECT_PATH || path.resolve('../..');
const settingsPath = path.resolve(projectPath, 'settings.yml');
const settings = safeLoad(readFileSync(settingsPath))
writeFileSync('./public/settings.json', JSON.stringify(settings))
