// Exports next.js functions as Netlify functions
// Netlify does not allow nested directories for functions
// so if we're building the preview for landscapeapp we will prefix function names with `$landscapeName--`

import path from 'path';
import { distPath, projectPath } from './settings';
import fs from 'fs'
import ncc from '@vercel/ncc'

const { PROJECT_NAME, PROJECT_PATH } = process.env

const destFolder = path.resolve(distPath, 'functions');
const srcFolder = `${process.env.PWD}/src/api`;

fs.rmSync(destFolder, { recursive: true, force: true })
fs.mkdirSync(destFolder, { recursive: true })

const files = fs.readdirSync(srcFolder)

async function main() {
  for (let file of files) {
    const destFile = [PROJECT_NAME, file].filter(_ => _).join('--')
    console.info("Processing: file", file);
    const { code } = await ncc(`${srcFolder}/${file}`);

    const f = (x) => fs.readFileSync(path.resolve(projectPath, x), 'utf-8');

    code = code.replace(
      'module.exports = eval("require")("dist/data/items");',
      `module.exports = ${f('dist/data/items.json')};`
    )
    code = code.replace(
      'module.exports = eval("require")("dist/settings");',
      `module.exports = ${f('dist/settings.json')};`
    )
    code = code.replace(
      'module.exports = eval("require")("project/lookup");',
      `module.exports = ${f('lookup.json')};`
    )

    fs.writeFileSync(`${destFolder}/${destFile}`, code)
  }
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});
