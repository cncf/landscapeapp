import Promise from 'bluebird';
import { projectPath, settings } from './settings';
import path from 'path';

const getLastCommitSha = function() {
  return require('child_process').execSync(`cd '${projectPath}' && git log -n 1 --format=format:%h`).toString('utf-8').trim();
}
const port = process.env.PORT || '4000';
async function main() {
  const sha = await getLastCommitSha();
  const time = new Date().toISOString().slice(0, 19) + 'Z';
  const version = `${time} ${sha}`;
  const puppeteer = require('puppeteer');
  const landscapes = Object.values(settings.big_picture);

  let previews = [];
  if (landscapes.length > 1) {
    previews = landscapes.map(({ url, fullscreen_size }) => {
      return {
        url: `/${url}?preview&version=${version}`,
        size: {width: fullscreen_size.width * 4, height: fullscreen_size.height * 4, deviceScaleFactor: 0.5},
        fileName: `${url}_preview.png`
      }
    })
  }

  const full_sizes = landscapes.map(({ url, fullscreen_size }) => {
    return {
      url: `/${url}?version=${version}`,
      size: {width: fullscreen_size.width * 4, height: fullscreen_size.height * 4, deviceScaleFactor: 1},
      fileName: `${url}.png`
    }
  });

  await Promise.mapSeries([previews, previews, full_sizes], async function(series) {
    await Promise.map(series, async function(pageInfo) {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage();
      page.setViewport(pageInfo.size)
      console.info(`visiting http://localhost:${port}${pageInfo.url}`);
      await page.goto(`http://localhost:${port}${pageInfo.url}&pdf`, { waitUntil: 'networkidle0'});
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
