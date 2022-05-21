const files = require('fs').readdirSync('src/svg');
for (let file of files) {
  if (file !== '.' && file !== '..' && file.endsWith('.svg')) {
    const iconName = file.split('.svg')[0];
    module.exports[iconName] = require('fs').readFileSync(`src/svg/${file}`, 'utf-8');
  }
}
