import  { settings } from './settings.js';
import  { projects } from './loadData.js';
import { render } from '../src/components/ItemDialogContentRenderer.js';

async function main() {
  const item = projects[0];
  const result = render({settings, itemInfo: item});
  console.info(result);
}
main();
