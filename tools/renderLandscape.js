import Promise from 'bluebird';
import { projectPath, settings } from './settings';
import { resolve } from 'path';
import { calculateSize, outerPadding, headerHeight } from "../src/shared/landscapeCalculations";

// TODO: DRY
const port = process.env.PORT || '4000';
const basePath = process.env.PROJECT_NAME ? `/${process.env.PROJECT_NAME}` : ''
const appUrl = `http://localhost:${port}${basePath}`

const getLastCommitSha = function() {
  return require('child_process').execSync(`cd '${projectPath}' && git log -n 1 --format=format:%h`).toString('utf-8').trim();
}

async function main() {
  const sha = await getLastCommitSha();
  const time = new Date().toISOString().slice(0, 19) + 'Z';
  const version = `${time} ${sha}`;
  if (process.env.USE_OLD_PUPPETEER) {
    const run = function(x) {
      console.info(require('child_process').execSync(x).toString())
    }
    run('~/.nvm/versions/node/`cat .nvmrc`/bin/yarn remove puppeteer');
    run('~/.nvm/versions/node/`cat .nvmrc`/bin/yarn add puppeteer@3.0.4');
    process.on('exit', function() {
      run('~/.nvm/versions/node/`cat .nvmrc`/bin/yarn remove puppeteer');
      run('~/.nvm/versions/node/`cat .nvmrc`/bin/yarn add puppeteer@4.0.1');
    });
  }
  const puppeteer = require('puppeteer');

  const landscapeSettingsList = Object.values(settings.big_picture)

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

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']});
  await Promise.mapSeries([previews, full_sizes], async function(series) {
    for (const pageInfo of series) {
      const { url, deviceScaleFactor, fileName, pdfFileName } = pageInfo
      const { width, height } = sizes[url]
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor })

      // TODO: this is the wrong path
      const fullUrl = `${appUrl}/${url}?version=${version}&scale=false&pdf`
      console.info(`visiting ${fullUrl}`);
      await page.goto(fullUrl, { waitUntil: 'networkidle0'});
      const imagesPath = [projectPath, 'dist', process.env.PROJECT_NAME, 'images'].filter(_ => _)
      await page.screenshot({ path: resolve(...imagesPath, fileName), fullPage: false });
      if (pdfFileName) {
        await page.emulateMediaType('screen');
        await page.pdf({path: resolve(...imagesPath, pdfFileName), width, height, printBackground: true, pageRanges: '1' });
      }
    }
  });
  await browser.close();
}
main().catch(function(e) {
  console.info(e);
  process.exit(1);
});
