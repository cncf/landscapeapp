import path from 'path';
import { writeFileSync } from 'fs'
import { projectPath, settings } from './settings';

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

const fileName = path.resolve(projectPath, 'robots.txt');
writeFileSync(fileName, content);
