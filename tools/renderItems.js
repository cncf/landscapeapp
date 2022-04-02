import path from 'path';
import  { settings, projectPath } from './settings.js';
import  { projects } from './loadData.js';
import { processedLandscape } from './processedLandscape.js';
import { render } from '../src/components/ItemDialogContentRenderer.js';

async function main() {
  for (let item of projects) {
    const result = render({settings, itemInfo: item, tweetsCount: processedLandscape.twitter_options.count});
    // console.info(`Rendering ${item.id}`);
    require('fs').mkdirSync('public/data/items', { recursive: true});
    require('fs').mkdirSync(path.join(projectPath, 'dist/items'), { recursive: true});
    require('fs').writeFileSync(`public/data/items/info-${item.id}.html`, result);
    require('fs').writeFileSync(path.join(projectPath, `dist/items/info-${item.id}.html`), result);
  }
}
main();
