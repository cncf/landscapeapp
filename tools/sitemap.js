import {createSitemap} from 'sitemap';
import { projectPath, settings } from './settings';
import path from 'path';
const items = JSON.parse(require('fs').readFileSync(path.resolve(projectPath, 'data.json')));
import _ from 'lodash';

const sitemap = createSitemap({
  hostname: settings.global.website,
  cacheTime: 600 * 1000,
  urls: _.flatten([
    { url: '/' },
    items.map(function(item) {
      return {
        url: `selected=${item.id}`,
        img: [{
          url: item.href,
          caption: `${item.name} logo`
        }]
      };
    })
  ])
});
require('fs').writeFileSync(path.resolve(projectPath, 'dist/sitemap.xml'), sitemap);
