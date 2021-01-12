// Get all images which are not internalized
// for each image - try to copy it from cached_logos back to the hosted_logos
// and then update the landscape.yml

import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { projectPath } from './settings';
import { extractSavedImageEntries } from './fetchImages';
import {dump} from './yaml';

const source = require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
const traverse = require('traverse');

async function main() {
  const savedItems = await extractSavedImageEntries();
  const tree = traverse(source);
  const newSource = tree.map(function(node) {
    if (node && node.item === null) {
      if (node.logo.indexOf('http://') === 0 || node.logo.indexOf('https://') === 0) {
        // we need to get a logo and save it
        const savedItem = _.find(savedItems, { name: node.name, logo: node.logo });
        const fileName = savedItem.fileName;
        // move file
        const newPath = path.resolve(projectPath, 'hosted_logos', fileName);
        const oldPath = path.resolve(projectPath, 'cached_logos', fileName);
        fs.renameSync(oldPath, newPath);
        // update an entry
        node.logo = fileName;
        console.info(`${savedItem.logo} updated to ${node.logo} on ${node.name}`);
      }
    }
  });
  require('fs').writeFileSync(path.resolve(projectPath, 'landscape.yml'), dump(newSource));
}
main().catch(console.info);
