import path from 'path'
import { load  } from 'js-yaml'
import fs from 'fs/promises';
import { execSync } from 'child_process'
import qs from 'query-string'
import loadGuide from './loadGuide'
import { projectPath, settings, distPath } from './settings';

const items = require(path.resolve(projectPath, 'data.json'))
const { website } = settings.global

//render
async function main() {
  await fs.rm(distPath, { recursive: true, force: true });
  await fs.mkdir(path.resolve(distPath, 'logos'), { recursive: true });
  execSync(`cp -r "${projectPath}/images" "${distPath}"`);
  execSync(`cp ${projectPath}/cached_logos/* "${distPath}/logos"`);
  await fs.writeFile(path.resolve(distPath, 'settings.json'), JSON.stringify(settings));
  await fs.mkdir(path.resolve(distPath, 'data', 'exports'), { recursive: true });
  await fs.mkdir(path.resolve(distPath, 'data', 'items'), { recursive: true });
  await fs.writeFile(path.resolve(distPath, 'data', 'items.json'), JSON.stringify(items))
  await fs.writeFile(path.resolve(distPath, '_headers'),
    await fs.readFile('_headers', 'utf-8'));
  await fs.copyFile( path.resolve(projectPath, 'images', 'favicon.png'), path.resolve(distPath, 'favicon.png'));
  for (let item of items) {
    await fs.writeFile(path.resolve(distPath, 'data', 'items', `${item.id}.json`), JSON.stringify(item))
  };

  const guide = loadGuide();
  if (guide) {
    await fs.writeFile(path.resolve(distPath, 'guide.json'), JSON.stringify(guide))
  }

  const prepareItemsForExport = require('./prepareItemsForExport').default
  const { flattenItems } = require('../src/utils/itemsCalculator')
  const getGroupedItems  = require('../src/utils/itemsCalculator').default
  const { parseParams } = require('../src/utils/routing')

  const itemsForExport = prepareItemsForExport(items)
  await fs.writeFile(path.resolve(distPath, 'data', 'items-export.json'), JSON.stringify(itemsForExport))

  for ( let element of Object.entries(settings.export || {})) {
    let [exportPath, query] = element;
    const params = parseParams({ mainContentMode: 'card-mode', ...qs.parse(query) })
    const groupedItems = getGroupedItems({data: items, ...params})
      .map(group => {
        const items = group.items.map(({ id, name, href }) => ({ id, name, logo: `${website}/${href}` }))
        return { ...group, items }
      })

    const exportItems = params.grouping === 'no' ? flattenItems(groupedItems) : groupedItems
    await fs.writeFile(path.resolve(distPath, 'data', 'exports',  `${exportPath}.json`), JSON.stringify(exportItems));
  }
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});
