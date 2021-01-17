import path from 'path'
import { load  } from 'js-yaml'
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmdirSync } from 'fs'
import { execSync } from 'child_process'
import prepareItemsForExport from './prepareItemsForExport'

const projectPath = process.env.PROJECT_PATH || path.resolve('../..')
const settingsPath = path.resolve(projectPath, 'settings.yml')
const settings = load(readFileSync(settingsPath))
const items = require(path.resolve(projectPath, 'data.json'))

rmdirSync('public', { recursive: true })
mkdirSync('public', { recursive: true })
execSync(`cp -r "${projectPath}/images" public`)
execSync(`cp -r "${projectPath}/cached_logos" public/logos`)
writeFileSync('./public/settings.json', JSON.stringify(settings))

if (!existsSync('./public/data')) {
  mkdirSync('./public/data')
}

items.forEach(item => {
  writeFileSync(`./public/data/${item.id}.json`, JSON.stringify(item))
})

const itemsForExport = prepareItemsForExport(items)
writeFileSync(`./public/data/items-export.json`, JSON.stringify(itemsForExport))
