import path from 'path';
import  { settings, projectPath } from './settings.js';
import  { projects } from './loadData.js';
import { processedLandscape } from './processedLandscape.js';
import { render } from '../src/components/ItemDialogContentRenderer.js';
import * as CardRenderer from '../src/components/CardRenderer.js';
import fs from 'fs/promises';

async function main() {
  await fs.mkdir('public/data/items', { recursive: true});
  await fs.mkdir(path.join(projectPath, 'dist/items'), { recursive: true});
  for (let item of projects) {
    const result = render({settings, itemInfo: item, tweetsCount: processedLandscape.twitter_options.count});
    // console.info(`Rendering ${item.id}`);
    await fs.writeFile(`public/data/items/info-${item.id}.html`, result);
  }

  let defaultCards = '';
  let borderlessCards = '';
  let flatCards = '';
  for (let item of projects) {
    const defaultCard = CardRenderer.renderDefaultCard({item});
    defaultCards += defaultCard;
    const borderlessCard = CardRenderer.renderBorderlessCard({item});
    borderlessCards += borderlessCard;
    const flatCard = CardRenderer.renderFlatCard({item});
    flatCards += flatCard;
  }

  await fs.writeFile(`public/data/items/cards-card.html`, defaultCards);
  await fs.writeFile(`public/data/items/cards-borderless.html`, borderlessCards);
  await fs.writeFile(`public/data/items/cards-flat.html`, flatCards);

}
main();
