import Promise from 'bluebird';
import { projectPath } from './settings';
import path from 'path';
import { landscapeSettingsList } from "../src/utils/landscapeSettings";

const getLastCommitSha = function() {
  return require('child_process').execSync(`cd '${projectPath}' && git log -n 1 --format=format:%h`).toString('utf-8').trim();
}
const port = process.env.PORT || '4000';
async function main() {
  const sha = await getLastCommitSha();
  const time = new Date().toISOString().slice(0, 19) + 'Z';
  const version = `${time} ${sha}`;
  const puppeteer = require('puppeteer');

  const pageAttributes = ({ url, fullscreen_size, deviceScaleFactor = 1 }) => {
    return {
      url: `/${url}?version=${version}`,
      size: { width: fullscreen_size.width * 4, height: fullscreen_size.height * 4, deviceScaleFactor },
    }
  }

  let previews = [];
  if (landscapeSettingsList.length > 1) {
    previews = landscapeSettingsList.map(({ url, fullscreen_size }) => {
      const deviceScaleFactor = 960 / (fullscreen_size.width * 4);
      const fileName = `${url}_preview.png`;
      return { fileName, ...pageAttributes({ url, fullscreen_size, deviceScaleFactor }) };
    })
  }

  const full_sizes = landscapeSettingsList.map(({ url, fullscreen_size }) => {
    const fileName = `${url}.png`;
    const pdfFileName = `${url}.pdf`;
    return { fileName, pdfFileName, ...pageAttributes({ url, fullscreen_size }) };
  });

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  await Promise.mapSeries([previews, full_sizes], async function(series) {
    for (const pageInfo of series) {
      const page = await browser.newPage();
      page.setViewport(pageInfo.size)
      console.info(`visiting http://localhost:${port}${pageInfo.url}`);
      await page.goto(`http://localhost:${port}${pageInfo.url}&pdf`, { waitUntil: 'networkidle0'});
      await page.screenshot({ path: path.resolve(projectPath, 'dist/images/' + pageInfo.fileName), fullPage: false });
      if (pageInfo.pdfFileName) {
        await page.emulateMediaType('screen');
        await page.pdf({path: path.resolve(projectPath, 'dist/images/' + pageInfo.pdfFileName), ...pageInfo.size, printBackground: true, pageRanges: '1' });
      }
    }
  });
  await browser.close();
}
main().catch(console.info);
