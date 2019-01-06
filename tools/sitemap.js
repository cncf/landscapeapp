import {createSitemap} from 'sitemap';
import { projectPath, settings } from './settings';
import path from 'path';
const items = JSON.parse(require('fs').readFileSync(path.resolve(projectPath, 'data.json')));
import _ from 'lodash';

const sitemap = createSitemap({
  hostname: settings.global.website,
  cacheTime: 600 * 1000,
  urls: _.flatten([
    { url: '/',
      img: _.values(settings.big_picture).map(function(section) {
        return {
          title: section.title,
          url: `images/${section.url}.png`,
          license: 'https://creativecommons.org/licenses/by/4.0/'
        }
      }).concat([{
        title: `${settings.global.short_name} Landscape Logo`,
        url: `images/left-logo.svg`,
        license: 'https://creativecommons.org/licenses/by/4.0/'
      }, {
        title: `${settings.global.short_name} Logo`,
        url: `images/right-logo.svg`,
        license: 'https://creativecommons.org/licenses/by/4.0/'
      }])
    },
    items.map(function(item) {
      return {
        url: `selected=${item.id}`,
        img: [{
          url: item.href,
          title: `${item.name} logo`
        }]
      };
    })
  ])
});
require('fs').writeFileSync(path.resolve(projectPath, 'dist/sitemap.xml'), sitemap);
