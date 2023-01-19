// used without any lib to just remove puppeteer references from the package.json
const lines = require('fs').readFileSync('package.json', 'utf-8').split('\n');
const goodLines = lines.filter( (x) => x.indexOf('puppeteer') === -1);
const newData = goodLines.join('\n');
require('fs').writeFileSync('package.json', newData);

