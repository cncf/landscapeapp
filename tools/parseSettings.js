import path from 'path'
import { safeLoad } from 'js-yaml'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
const projectPath = process.env.PROJECT_PATH || path.resolve('../..');
const settingsPath = path.resolve(projectPath, 'settings.yml');
const settings = safeLoad(readFileSync(settingsPath))
writeFileSync('./public/settings.json', JSON.stringify(settings))

if (!existsSync('./public/data')) {
  mkdirSync('./public/data')
}

const items = require(path.resolve(projectPath, 'data.json'))

items.forEach(item => {
  writeFileSync(`./public/data/${item.id}.json`, JSON.stringify(item))
})
