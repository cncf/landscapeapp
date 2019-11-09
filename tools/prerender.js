import { projectPath } from './settings';
import path from 'path';
import fs from 'fs';

const url = require("url");
const { run } = require("react-snap/index.js");

async function main() {
  const file200 = path.resolve(projectPath, 'dist', '200.html');
  const fileIndex = path.resolve(projectPath, 'dist', 'index.html');
  const filePrerender = path.resolve(projectPath, 'dist', 'prerender.html');
  const source = path.resolve(projectPath, 'dist');
  console.info(file200, fileIndex, filePrerender, source);
  if (fs.existsSync(file200)) {
    fs.copyFileSync(file200, fileIndex);
    fs.unlinkSync(file200);
  }
  try {
    console.info(path.relative('.', source));
    await run({
      publicPath: "/",
      crawl: false,
      source: path.relative('.', source),
      puppeteerArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
      skipThirdPartyRequests: true
    });
  } catch(error) {
    console.info('Boom');
    console.error(error);
    process.exit(1);
  }
  fs.copyFileSync(fileIndex, filePrerender);
  fs.copyFileSync(file200, fileIndex);
};
main().catch(function(ex) {
  console.error(ex);
  process.exit(1);
});

