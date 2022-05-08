import { getLandscapeCategories } from '../src/utils/sharedItemsCalculator';
import fields from '../src/types/fields';
import { SitemapStream } from 'sitemap';
import { projectPath, distPath, settings } from './settings';
import path from 'path';
const items = JSON.parse(require('fs').readFileSync(path.resolve(projectPath, 'data.json')));
import _ from 'lodash';
import { landscapeSettingsList } from "../src/utils/landscapeSettings";


async function main() {
  const bigPictureElements = {};
  const landscape = fields.landscape.values;
  landscapeSettingsList.forEach((landscapeSettings) => {
    const categories = getLandscapeCategories({landscapeSettings, landscape});
    bigPictureElements[landscapeSettings.url] = {
      categories: categories.map( ({ label }) => label)
    }
  });

  const sectionsWithOrder = [{key: 'card-mode', tab_index: 0}].concat( _.keys(settings.big_picture).map(function(key) {
    return {
      key: key,
      tab_index: settings.big_picture[key].tab_index
    }
  }));


  const stream = new SitemapStream({
    hostname: settings.global.website,
    cacheTime: 600 * 1000,
  });
  const fileName = path.resolve(distPath, 'sitemap.xml');
  const writeStream = require('fs').createWriteStream(fileName);
  stream.pipe(writeStream);

  const urls = _.flatten([
    landscapeSettingsList.map(function(section) {
      return {
        url: `images/${section.url}.pdf`,
        img: [{
          title: section.title,
          url: `images/${section.url}.pdf`,
          license: 'https://creativecommons.org/licenses/by/4.0/'
        }]
      }
    }),
    _.orderBy(sectionsWithOrder, 'tab_index').map(function(orderEntry) {
      if (orderEntry.key === 'card-mode') {
        return {
          url: '/card-mode',
        };
      }
      const section = settings.big_picture[orderEntry.key];
      return {
        url: `/${section.basePath}`,
        img: [{
          title: section.title,
          url: `images/${section.url}.png`,
          license: 'https://creativecommons.org/licenses/by/4.0/'
        }].concat ( orderEntry.key === 'main' ? [{
          title: `${settings.global.short_name} Landscape Logo`,
          url: 'images/left-logo.svg'
        }, {
          title: `${settings.global.short_name} Logo`,
          url: 'images/right-logo.svg'
        }] : [])
      };
    }),
    items.map(function(item) {
      const landscapeInfo = _.find(bigPictureElements, function(entry) {
        return entry.categories.indexOf(item.category) !== -1;
      });

      const basePath = !landscapeInfo ? 'card-mode' : landscapeInfo.basePath

      return {
        url: `/${basePath}?selected=${item.id}`,
        img: [{
          url: item.href,
          title: `${item.name} logo`
        }]
      };
    })
  ]);

  for (var url of urls) {
    stream.write(url);
  }
  writeStream.on('error', (err) => {
      console.error(Error(err))
  })
  stream.on('error', (err) => {
      console.error(Error(err))
  })
  stream.end();
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});
