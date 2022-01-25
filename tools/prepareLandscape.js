import path from 'path'
import { load  } from 'js-yaml'
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync,readdir,statSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import qs from 'query-string'
import loadGuide from './loadGuide'

const projectPath = process.env.PROJECT_PATH || path.resolve('../..')
const settingsPath = path.resolve(projectPath, 'settings.yml')
const settings = load(readFileSync(settingsPath))
const items = require(path.resolve(projectPath, 'data.json'))
const { website } = settings.global

rmSync('public', { recursive: true, force: true })
mkdirSync('public/images', { recursive: true });
mkdirSync('public/logos', { recursive: true });

// execSync(`cp -r "${projectPath}/images" public`)
// execSync(`cp -r "${projectPath}/cached_logos" public/logos`)
readdirSync(`${projectPath}/images`).forEach((item,index)=>{
    const tempPath = path.join(`${projectPath}/images`,item);
    const temp = statSync(tempPath);
    if(temp.isFile){
      copyFileSync(tempPath,path.join('public/images',item))
    }
});

readdirSync(`${projectPath}/cached_logos`).forEach((item,index)=>{
    const tempPath = path.join(`${projectPath}/cached_logos`,item);
    const temp = statSync(tempPath);
    if(temp.isFile){
      copyFileSync(tempPath,path.join('public/logos',item))
    }
});


writeFileSync('./public/settings.json', JSON.stringify(settings))

if (!existsSync('./public/data')) {
  mkdirSync('./public/data/exports', { recursive: true })
  mkdirSync('./public/data/items', { recursive: true })
}

writeFileSync(`./public/data/items.json`, JSON.stringify(items))

items.forEach(item => {
  writeFileSync(`./public/data/items/${item.id}.json`, JSON.stringify(item))
})

const guide = loadGuide()

if (guide) {
  writeFileSync('./public/guide.json', JSON.stringify(guide))
}

const afterSettingsSaved = _ => {
  const prepareItemsForExport = require('./prepareItemsForExport').default
  const { flattenItems } = require('../src/utils/itemsCalculator')
  const getGroupedItems  = require('../src/utils/itemsCalculator').default
  const { parseParams } = require('../src/utils/routing')

  const itemsForExport = prepareItemsForExport(items)
  writeFileSync(`./public/data/items-export.json`, JSON.stringify(itemsForExport))

  Object.entries(settings.export || {}).forEach(([exportPath, query]) => {
    const params = parseParams({ mainContentMode: 'card-mode', ...qs.parse(query) })
    const groupedItems = getGroupedItems(params, items)
      .map(group => {
        const items = group.items.map(({ id, name, href }) => ({ id, name, logo: `${website}/${href}` }))
        return { ...group, items }
      })

    const exportItems = params.grouping === 'no' ? flattenItems(groupedItems) : groupedItems
    writeFileSync(`./public/data/exports/${exportPath}.json`, JSON.stringify(exportItems))
  })
}

afterSettingsSaved()
