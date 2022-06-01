// Exports next.js functions as Netlify functions
// Netlify does not allow nested directories for functions
// so if we're building the preview for landscapeapp we will prefix function names with `$landscapeName--`

const path = require('path');
const fs  = require('fs');
const ncc = require('@vercel/ncc');

const { distPath  } = require('./settings');
const { readJsonFromDist, readJsonFromProject } = require('../src/utils/readJson');
const { settings } = require('./settings');

const items = readJsonFromDist('data/items');
const itemsExport = readJsonFromDist('data/items-export');
const lookup = readJsonFromProject('lookup');

const { PROJECT_NAME } = process.env

const destFolder = path.resolve(distPath, 'functions');
const srcFolder = `${process.env.PWD}/src/api`;

fs.rmSync(destFolder, { recursive: true, force: true })
fs.mkdirSync(destFolder, { recursive: true })

const files = fs.readdirSync(srcFolder)

async function main() {
  for (let file of files) {
    const destFile = [PROJECT_NAME, file].filter(_ => _).join('--')
    const { code } = await ncc(`${srcFolder}/${file}`);

    const finalCode = `
      global.lookups = {
        'items': ${JSON.stringify(items)},
        'items-export': ${JSON.stringify(itemsExport)},
        'settings': ${JSON.stringify(settings)},
        'lookup': ${JSON.stringify(lookup)}
      };
    ` + code;

    fs.writeFileSync(`${destFolder}/${destFile}`, finalCode)
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
