import path from 'path'
import { load  } from 'js-yaml'
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs'
import { execSync } from 'child_process'
import qs from 'query-string'
import loadGuide from './loadGuide'

const projectPath = process.env.PROJECT_PATH;
const settingsPath = path.resolve(projectPath, 'settings.yml')
const settings = load(readFileSync(settingsPath))
const items = require(path.resolve(projectPath, 'data.json'))
const { website } = settings.global

//render
rmSync(path.resolve(projectPath, 'dist'), { recursive: true, force: true });
mkdirSync(path.resolve(projectPath, 'dist', 'logos'), { recursive: true });
execSync(`cp -r "${projectPath}/images" "${projectPath}/dist"`);
execSync(`cp -r "${projectPath}/cached_logos/" "${projectPath}/dist/logos"`);
writeFileSync(path.resolve(projectPath, 'dist', 'settings.json'), JSON.stringify(settings));
mkdirSync(path.resolve(projectPath, 'dist', 'data', 'exports'), { recursive: true });
mkdirSync(path.resolve(projectPath, 'dist', 'data', 'items'), { recursive: true });
writeFileSync(path.resolve(projectPath, 'dist', 'data', 'items.json'), JSON.stringify(items))

items.forEach(item => {
  writeFileSync(path.resolve(projectPath, 'dist', 'data', 'items', `${item.id}.json`), JSON.stringify(item))
});

const guide = loadGuide();

if (guide) {
  writeFileSync(path.resolve(projectPath, 'dist', 'guide.json'), JSON.stringify(guide))
}

{
  const prepareItemsForExport = require('./prepareItemsForExport').default
  const { flattenItems } = require('../src/utils/itemsCalculator')
  const getGroupedItems  = require('../src/utils/itemsCalculator').default
  const { parseParams } = require('../src/utils/routing')

  const itemsForExport = prepareItemsForExport(items)
  writeFileSync(path.resolve(projectPath, 'dist', 'data', 'items-export.json'), JSON.stringify(itemsForExport))

  Object.entries(settings.export || {}).forEach(([exportPath, query]) => {
    const params = parseParams({ mainContentMode: 'card-mode', ...qs.parse(query) })
    const groupedItems = getGroupedItems({data: items, ...params})
      .map(group => {
        const items = group.items.map(({ id, name, href }) => ({ id, name, logo: `${website}/${href}` }))
        return { ...group, items }
      })

    const exportItems = params.grouping === 'no' ? flattenItems(groupedItems) : groupedItems
    console.info({exportItems});
    writeFileSync(path.resolve(projectPath, 'dist', 'data', 'exports',  `${exportPath}.json`), JSON.stringify(exportItems));
  })
}
