import  { settings } from './settings.js';
import  { projects } from './loadData.js';
import { render } from '../src/components/ItemDialogContentRenderer.js';

async function main() {
  const item = projects[0];
  for (let item of projects) {
    const result = render({settings, itemInfo: item});
    require('fs').writeFileSync(`dist/info-${item.id}.html`, result);
  }
}
main();
