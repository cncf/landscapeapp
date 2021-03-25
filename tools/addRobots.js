import { writeFileSync } from 'fs'
import { settings }  from './settings'

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

writeFileSync('out/robots.txt', content);
