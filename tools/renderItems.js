import  { settings } from './settings.js';
import  { projects } from './loadData.js';
import { processedLandscape } from './processedLandscape.js';
import { render } from '../src/components/ItemDialogContentRenderer.js';

async function main() {
  const item = projects[0];
  for (let item of projects) {
    const result = render({settings, itemInfo: item, tweetsCount: processedLandscape.twitter_options.count});
    console.info(`Rendering ${item.id}`);
    require('fs').writeFileSync(`dist/info-${item.id}.html`, result);
    require('fs').writeFileSync(`public/data/info-${item.id}.html`, result);
  }
}
main();
