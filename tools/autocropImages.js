const autoCropSvg = require('svg-autocrop');
const path = require('path');
const fs = require('fs');

const { projectPath } = require('./settings');

async function main() {
  const files = fs.readdirSync(path.resolve(projectPath, 'images'));
  const svgFiles = files.filter((x) => x.match(/\.svg$/));
  for (const file of svgFiles) {
    const fullPath = path.resolve(projectPath,'images', file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const processed = await autoCropSvg(content);
    fs.writeFileSync(fullPath, processed);
    console.info('Optimized an svg image: ', fullPath);
  }
}
main().catch(function(error) {
  console.info(error);
  process.exit(1);
});
