import './suppressAnnoyingWarnings';
import Promise from 'bluebird';
import { landscapeSettingsList } from '../src/utils/landscapeSettings'
import { setFatalError, reportFatalErrors } from './fatalErrors';
import { appUrl } from './distSettings'

async function main() {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  var hasErrors = false;
  for (const { basePath } of landscapeSettingsList) {
    const path = `/${basePath || ''}`
    const response = await page.goto(`${appUrl}${path}`);
    if (response.status() !== 200) {
      throw `[yarn check-landscape]: cannot load URL "${path}"`
    }
    await Promise.delay(20000);
    const errors = await page.evaluate( function() {
      var result = [];
      var sections = document.querySelectorAll('.big-picture-section');
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var title = section.childNodes[0].innerText || section.childNodes[1].innerText;
        var sectionBounds = section.getBoundingClientRect();
        var items = section.querySelectorAll('img');
        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          var itemBounds = item.getBoundingClientRect();
          if (itemBounds.right > sectionBounds.right - 2 || itemBounds.bottom > sectionBounds.bottom - 2) {
            if (result.indexOf(title) === -1) {
              result.push(title);
            }
          }
        }
      }
      return result;
    });
    if (errors.length > 0) {
      for (var error of errors) {
        setFatalError(`Page: ${path}, section ${error} is out of bound`);
      }
      console.info(`FATAL ERROR: layout issues. On a ${path} page, following section(s) has their items out of bounds:`);
      console.info(errors);
      hasErrors = true;
    }
  }
  await browser.close();
  if (hasErrors) {
    await reportFatalErrors();
    process.exit(2);
  }
}
main().catch(function(x) {
  console.info(x);
  process.exit(1);
});
