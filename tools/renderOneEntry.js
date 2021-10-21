// an experiment to render just a single item
import path from 'path';
import fs from 'fs';

import { settings, saveSettings } from './settings';
import { landscape, saveLandscape } from './landscape';
import { processedLandscape, updateProcessedLandscape } from './processedLandscape';

const members = settings.global.membership;
process.env.SELECTED_ITEM = 'Accord.NET';

const category = 'Machine Learning';
const subcategory = 'Framework';
const item = process.env.SELECTED_ITEM;

for (var l of [landscape, processedLandscape]) {
  l.landscape = l.landscape.filter( (x) => x.name === category || x.name === members);
  const categoryEntry = l.landscape.filter( (x) => x.name === category)[0];
  categoryEntry.subcategories = categoryEntry.subcategories.filter( (x) => x.name === subcategory);
  const subcategoryEntry = categoryEntry.subcategories[0];
  subcategoryEntry.items = subcategoryEntry.items.filter( (x) => x.name === item);
}



saveLandscape(landscape);
updateProcessedLandscape( () => processedLandscape);
