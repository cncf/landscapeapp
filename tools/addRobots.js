import branch from 'git-branch';
const currentBranch = require('process').env['BRANCH'] ||  branch.sync();
const isMainBranch = currentBranch === 'master';
import {projectPath, settings }  from './settings'
import path from 'path';

const content = isMainBranch ?
  `
User-agent: *
Allow: /$
Allow: /data.json$
Allow: /favicon.png$
Allow: /roboto-latin-*.woff$
Allow: /roboto-latin-*.woff2$
Allow: /main.*css$
Allow: /main.*js$
Allow: /main.googlebot.js?
Allow: /images/*.jpg$
Allow: /images/*.pdf$
Allow: /images/*.png$
Allow: /images/*.svg$
Allow: /logos/*.svg$
Disallow: /selected=*&
Allow: /selected=
Disallow: /

Sitemap: ${settings.global.website}/sitemap.xml
  `
  :
  `
User-agent: *
Disallow: /
  `
;

require('fs').writeFileSync(path.resolve(projectPath, 'dist/robots.txt'), content);
