import Promise from 'bluebird';
import { projectPath } from './settings';
import { resolve } from 'path';
import { landscapeSettingsList } from "../src/utils/landscapeSettings";
import { calculateSize, outerPadding, headerHeight } from "../src/utils/landscapeCalculations";

const getLastCommitSha = function() {
  return require('child_process').execSync(`cd '${projectPath}' && git log -n 1 --format=format:%h`).toString('utf-8').trim();
}
const port = process.env.PORT || '4000';
async function main() {
  const sha = await getLastCommitSha();
  const time = new Date().toISOString().slice(0, 19) + 'Z';
  const version = `${time} ${sha}`;
  const puppeteer = require('puppeteer');

  const sizes = landscapeSettingsList.reduce((acc, landscapeSettings) => {
    const { width, height } = calculateSize(landscapeSettings)
    const size = { width: width + 2 * outerPadding, height: height + headerHeight + 2 * outerPadding }

    return { ...acc, [landscapeSettings.url]: size }
  }, {})

  let previews = [];
  previews = landscapeSettingsList.map(({ url }) => {
    const { width } = sizes[url]
    const deviceScaleFactor = 960 / width;
    const fileName = `${url}_preview.png`;
    return { fileName, url, deviceScaleFactor };
  })

  const full_sizes = landscapeSettingsList.map(({ url }) => {
    const fileName = `${url}.png`;
    const pdfFileName = `${url}.pdf`;
    return { fileName, pdfFileName, url, deviceScaleFactor: 4 };
  });

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  await Promise.mapSeries([previews, full_sizes], async function(series) {
    for (const pageInfo of series) {
      const { url, deviceScaleFactor, fileName, pdfFileName } = pageInfo
      const { width, height } = sizes[url]
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor })

      const fullUrl = `http://localhost:${port}/${url}?version=${version}&scale=false&pdf`
      console.info(`visiting ${fullUrl}`);
      await page.goto(fullUrl, { waitUntil: 'networkidle0'});
      await page.screenshot({ path: resolve(projectPath, 'dist', 'images', fileName), fullPage: false });
      if (pdfFileName) {
        await page.emulateMediaType('screen');
        await page.pdf({path: resolve(projectPath, 'dist', 'images', pdfFileName), width, height, printBackground: true, pageRanges: '1' });
      }
    }
  });
  await browser.close();
}
main().catch(console.info);
