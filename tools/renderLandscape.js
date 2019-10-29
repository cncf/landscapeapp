import Promise from 'bluebird';
import { projectPath, settings } from './settings';
import path from 'path';

const mainSettings = settings.big_picture.main;
const extraSettings = settings.big_picture.extra;
const thirdSettings = settings.big_picture.third;

const getLastCommitSha = function() {
  return require('child_process').execSync(`cd '${projectPath}' && git log -n 1 --format=format:%h`).toString('utf-8').trim();
}
const port = process.env.PORT || '4000';
async function main() {
  const sha = await getLastCommitSha();
  const time = new Date().toISOString().slice(0, 19) + 'Z';
  const version = `${time} ${sha}`;
  const puppeteer = require('puppeteer');
  const previewScaleFactor = 0.5;

  const pagesInPairs = extraSettings ? [
    [{
    url: `/${mainSettings.url}?preview&version=${version}`,
    size: {width: mainSettings.fullscreen_size.width * 4, height: mainSettings.fullscreen_size.height * 4, deviceScaleFactor: previewScaleFactor},
    fileName: `${mainSettings.url}_preview.png`
  }, {
    url: `/${extraSettings.url}?preview&version=${version}`,
    size: {width: extraSettings.fullscreen_size.width * 4, height: extraSettings.fullscreen_size.height * 4, deviceScaleFactor: previewScaleFactor},
    fileName: `${extraSettings.url}_preview.png`
  }], [{
    url: `/${mainSettings.url}?preview&version=${version}`,
    size: {width: mainSettings.fullscreen_size.width * 4, height: mainSettings.fullscreen_size.height * 4, deviceScaleFactor: previewScaleFactor},
    fileName: `${mainSettings.url}_preview.png`
  }, {
    url: `/${extraSettings.url}?preview&version=${version}`,
    size: {width: extraSettings.fullscreen_size.width * 4, height: extraSettings.fullscreen_size.height * 4, deviceScaleFactor: previewScaleFactor},
    fileName: `${extraSettings.url}_preview.png`
  }], [{
    url: `/${mainSettings.url}?version=${version}`,
    size: {width: mainSettings.fullscreen_size.width * 4, height: mainSettings.fullscreen_size.height * 4, deviceScaleFactor: 1},
    fileName: `${mainSettings.url}.png`,
    pdfFileName: `${mainSettings.url}.pdf`
  }], [{
    url: `/${extraSettings.url}?version=${version}`,
    size: {width: extraSettings.fullscreen_size.width * 4, height: extraSettings.fullscreen_size.height * 4, deviceScaleFactor: 1},
    fileName: `${extraSettings.url}.png`,
    pdfFileName: `${extraSettings.url}.pdf`
  }]] : [[{
    url: `/${mainSettings.url}?version=${version}`,
    size: {width: mainSettings.fullscreen_size.width * 4, height: mainSettings.fullscreen_size.height * 4, deviceScaleFactor: 1},
    fileName: `${mainSettings.url}.png`,
    pdfFileName: `${mainSettings.url}.pdf`
  }]];
  if (thirdSettings) {
    pagesInPairs[0].push({
      url: `/${thirdSettings.url}?preview&version=${version}`,
      size: {width: thirdSettings.fullscreen_size.width * 4, height: thirdSettings.fullscreen_size.height * 4, deviceScaleFactor: previewScaleFactor},
      fileName: `${thirdSettings.url}_preview.png`
    });
    pagesInPairs[1].push({
      url: `/${thirdSettings.url}?preview&version=${version}`,
      size: {width: thirdSettings.fullscreen_size.width * 4, height: thirdSettings.fullscreen_size.height * 4, deviceScaleFactor: previewScaleFactor},
      fileName: `${thirdSettings.url}_preview.png`
    });
    pagesInPairs.push([{
      url: `/${thirdSettings.url}?version=${version}`,
      size: {width: thirdSettings.fullscreen_size.width * 4, height: thirdSettings.fullscreen_size.height * 4, deviceScaleFactor: 1},
      fileName: `${thirdSettings.url}.png`,
      pdfFileName: `${thirdSettings.url}.pdf`
    }]);
  }
  await Promise.mapSeries(pagesInPairs, async function(pair) {
    await Promise.map(pair, async function(pageInfo) {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage();
      page.setViewport(pageInfo.size)
      console.info(`visiting http://localhost:${port}${pageInfo.url}`);
      await page.goto(`http://localhost:${port}${pageInfo.url}&pdf`);
      await Promise.delay(10000);
      await page.screenshot({ path: path.resolve(projectPath, 'dist/images/' + pageInfo.fileName), fullPage: false });
      if (pageInfo.pdfFileName) {
        await page.emulateMediaType('screen');
        await page.pdf({path: path.resolve(projectPath, 'dist/images/' + pageInfo.pdfFileName), ...pageInfo.size, printBackground: true, pageRanges: '1' });
      }
      await browser.close();
    });
  });
}
main().catch(console.info);
