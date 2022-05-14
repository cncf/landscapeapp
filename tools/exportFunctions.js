// Exports next.js functions as Netlify functions
// Netlify does not allow nested directories for functions
// so if we're building the preview for landscapeapp we will prefix function names with `$landscapeName--`

import path from 'path';
import { distPath, projectPath } from './settings';
import fs from 'fs'
import ncc from '@vercel/ncc'

import items from 'dist/data/items';
import itemsExport from 'dist/data/items-export';
import settings from 'dist/settings';
import lookup from 'project/lookup';

const { PROJECT_NAME, PROJECT_PATH } = process.env

const destFolder = path.resolve(distPath, 'functions');
const srcFolder = `${process.env.PWD}/src/api`;

fs.rmSync(destFolder, { recursive: true, force: true })
fs.mkdirSync(destFolder, { recursive: true })

const files = fs.readdirSync(srcFolder)

async function main() {
  for (let file of files) {
    const destFile = [PROJECT_NAME, file].filter(_ => _).join('--')
    const { code } = await ncc(`${srcFolder}/${file}`);

    code = code.replace(
      'module.exports = eval("require")("dist/data/items");',
      `module.exports = ${JSON.stringify(items)};`
    )
    code = code.replace(
      'module.exports = eval("require")("dist/data/items-export");',
      `module.exports = ${JSON.stringify(itemsExport)};`
    )
    code = code.replace(
      'module.exports = eval("require")("dist/settings");',
      `module.exports = ${JSON.stringify(settings)};`
    )
    code = code.replace(
      'module.exports = eval("require")("project/lookup");',
      `module.exports = ${JSON.stringify(lookup)};`
    )

    fs.writeFileSync(`${destFolder}/${destFile}`, code)
    if (code.includes('eval("')) {
      console.info('forgot to embed a module');
      process.exit(1);
    }
  }
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});
