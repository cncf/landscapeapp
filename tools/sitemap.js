import {createSitemap} from 'sitemap';
import { projectPath, settings } from './settings';
import path from 'path';
const items = JSON.parse(require('fs').readFileSync(path.resolve(projectPath, 'data.json')));
import _ from 'lodash';
import Promise from 'bluebird';

const urls = _.map(settings.big_picture, (section) => section.url);
const port = process.env.PORT || '4000';
const bigPictureElements = {};

async function main() {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  var hasErrors = false;
  for (var format of urls) {
    await page.goto(`http://localhost:${port}/format=${format}`);
    await Promise.delay(10000);
    const newUrl = await page.evaluate ( (x) => window.location.href );

    const images = await page.evaluate( function() {
      var imgs = document.querySelectorAll('.big-picture-section img[src]');
      var result = [];
      for (var i = 0; i < imgs.length; i++) {
        result.push(imgs[i].getAttribute('src'));
      }
      return result;
    });
    const urlPart = (newUrl.match(/format=(.*)/) || [])[1];
    console.info({format, newUrl, urlPart, images: images.length});
    bigPictureElements[format] = {
      format: format,
      images: images,
      urlPart:  urlPart
    }
  }
  await browser.close();

  const sitemap = createSitemap({
    hostname: settings.global.website,
    cacheTime: 600 * 1000,
    urls: _.flatten([
      _.values(settings.big_picture).map(function(section) {
        return {
          url: `images/${section.url}.pdf`,
          img: [{
            title: section.title,
            url: `images/${section.url}.pdf`,
            license: 'https://creativecommons.org/licenses/by/4.0/'
          }]
        }
      }),
      { url: '/',
        img: _.values(settings.big_picture).map(function(section) {
          return {
            title: section.title,
            url: `images/${section.url}.png`,
            license: 'https://creativecommons.org/licenses/by/4.0/'
          }
        }).concat([{
          title: `${settings.global.short_name} Landscape Logo`,
          url: 'images/left-logo.svg',
        }, {
          title: `${settings.global.short_name} Logo`,
          url: 'images/right-logo.svg',
        }])
      },
      items.map(function(item) {
        const landscapeInfo = _.find(bigPictureElements, function(entry) {
          return entry.images.indexOf(item.href) !== -1;
        });

        // console.info(item, landscapeInfo);

        const formatPart = (function() {
          if (!landscapeInfo) {
            return 'format=card-mode&'
          }
          console.info(item.name, item.href, landscapeInfo.urlPart);
          if (!landscapeInfo.urlPart) {
            return ''
          }
          return `format=${landscapeInfo.urlPart}&`;
        })();

        console.info(item.name, formatPart);

        return {
          url: `${formatPart}selected=${item.id}`,
          img: [{
            url: item.href,
            title: `${item.name} logo`
          }]
        };
      })
    ])
  });
  require('fs').writeFileSync(path.resolve(projectPath, 'dist/sitemap.xml'), sitemap);
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});
