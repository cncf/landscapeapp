// update generated files so they reference a proper location
import fs from 'fs';
import path from 'path';
import minimatch from 'minimatch';
import _ from 'lodash';
import replace from 'string-replace-all';

const projectName = process.argv[2];
const filesLocation = path.resolve('dist', projectName);
const files = fs.readdirSync(filesLocation);
function update(original, updated, file) {
  const realFile = _.find(files, (x) => minimatch(x, file));
  console.info(`replacing ${original} to ${updated} in ${realFile}`);
  const content = require('fs').readFileSync(path.resolve(filesLocation, realFile), 'utf-8');
  const updatedContent = replace(content, original, updated);
  require('fs').writeFileSync(path.resolve(filesLocation, realFile), updatedContent);
}


update('/main', `/${projectName}/main`, 'index.html');
update('/favicon', `/${projectName}/favicon`, 'index.html');
update('/assets', `/${projectName}/assets`, 'index.html');
update('url(/', `url(/${projectName}/`, 'main.*.css');
update('/images', `/${projectName}/images`, 'main.*.js');
update('/logos', `/${projectName}/logos`, 'main.*.js');
update('/data.json', `/${projectName}/data.json`, 'main.*.js');
update('/logos', `/${projectName}/logos`, 'data.json');
update('window.prefix=""', `window.prefix="/${projectName}"`, 'index.html');
