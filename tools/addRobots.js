import branch from 'git-branch';
const currentBranch = require('process').env['BRANCH'] ||  branch.sync();
const isMainBranch = currentBranch === 'master';
import {projectPath, settings }  from './settings'
import path from 'path';

const content = isMainBranch ?
  `
User-agent: *
Disallow: *grouping=
Disallow: *sort=
Disallow: *landscape=
Disallow: *cncf=
Disallow: *license=
Disallow: *organization=
Disallow: *headquarters=
Disallow: *format=
Disallow: *zoom=
Disallow: /funding.html$
Disallow: /${settings.big_picture.main.url}$
${settings.big_picture.extra ? `Disallow: /${settings.big_picture.extra.url}$` : '' }

Sitemap: ${settings.global.website}/sitemap.xml
  `
  :
  `
User-agent: *
Disallow: /
  `
;

require('fs').writeFileSync(path.resolve(projectPath, 'dist/robots.txt'), content);
