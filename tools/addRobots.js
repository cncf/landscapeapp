const path = require('path');
const { writeFileSync } = require('fs');
const { distPath, settings } = require('./settings');

const isMainBranch = process.env.PULL_REQUEST !== 'true'

const content = isMainBranch ?
  `
User-agent: *
Allow: *

Sitemap: ${settings.global.website}/sitemap.xml
  `
  :
  `
User-agent: *
Disallow: /
  `
;

const fileName = path.resolve(distPath, 'robots.txt');
writeFileSync(fileName, content);
