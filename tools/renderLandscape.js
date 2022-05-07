import path from 'path';
import Promise from 'bluebird';
import { projectPath, distPath } from './settings';
import { resolve } from 'path';
import { landscapeSettingsList } from '../src/utils/landscapeSettings'
import { calculateSize } from "../src/utils/landscapeCalculations";
import { appUrl } from './distSettings'

const getLastCommitSha = function() {
  return require('child_process').execSync(`cd '${projectPath}' && git log -n 1 --format=format:%h`).toString('utf-8').trim();
}

async function main() {
  const sha = await getLastCommitSha();
  const time = new Date().toISOString().slice(0, 19) + 'Z';
  const version = `${time} ${sha}`;
  const puppeteer = require('puppeteer');

  const sizes = landscapeSettingsList.reduce((acc, landscapeSettings) => {
    const { fullscreenWidth, fullscreenHeight } = calculateSize(landscapeSettings)
    const size = { width: fullscreenWidth, height: fullscreenHeight }

    return { ...acc, [landscapeSettings.url]: size }
  }, {})

  let previews = [];
  previews = landscapeSettingsList.map(({ url, basePath }) => {
    const { width } = sizes[url]
    const deviceScaleFactor = 960 / width;
    const fileName = `${url}_preview.png`;
    return { fileName, url, basePath, deviceScaleFactor };
  })

  const full_sizes = landscapeSettingsList.map(({ url, basePath }) => {
    const fileName = `${url}.png`;
    const pdfFileName = `${url}.pdf`;
    return { fileName, pdfFileName, url, basePath, deviceScaleFactor: 4 };
  });

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']});
  await Promise.mapSeries([previews, full_sizes], async function(series) {
    for (const pageInfo of series) {
      const { url, deviceScaleFactor, fileName, pdfFileName, basePath } = pageInfo
      const { width, height } = sizes[url]
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(120 * 1000);
      await page.setViewport({ width, height, deviceScaleFactor })

      const baseUrl = [appUrl, 'fullscreen', basePath].filter(_ => _).join('/')
      const fullUrl = `${baseUrl}?version=${version}&scale=false&pdf`
      console.info(`visiting ${fullUrl}`);
      await page.goto(fullUrl, { waitUntil: 'networkidle0'});
      await page.screenshot({ path: resolve(distPath, 'images', fileName), fullPage: false });
      if (pdfFileName) {
        await page.emulateMediaType('screen');
        const pdfPath = resolve(distPath, 'images', pdfFileName);
        const pdfData = await page.pdf({width, height, printBackground: true, pageRanges: '1' });
        require('fs').writeFileSync(pdfPath, pdfData);
      }
    }
  });
  await browser.close();
}
main().catch(function(e) {
  console.info(e);
  process.exit(1);
});
