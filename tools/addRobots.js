import branch from 'git-branch';
const currentBranch = require('process').env['BRANCH'] ||  branch.sync();
const isMainBranch = currentBranch === 'master';
import {projectPath, settings }  from './settings'
import path from 'path';

const content = isMainBranch ?
  `
User-agent: *
Disallow: /*node_modules
Allow: *

Sitemap: ${settings.global.website}/sitemap.xml
  `
  :
  `
User-agent: *
Disallow: /
  `
;

require('fs').writeFileSync(path.resolve(projectPath, 'dist/robots.txt'), content);
