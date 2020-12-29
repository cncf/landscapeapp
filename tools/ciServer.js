// TODO: this should be dist server?
import path from 'path';
import { existsSync, readFileSync } from 'fs'
import express from 'express'
import serveStatic from 'serve-static'
import {chalkProcessing} from './chalkConfig'
import { projectPath } from './settings'

const app = express()
const distPath = path.resolve(projectPath, 'dist')

console.log(chalkProcessing('running a dist server on http://localhost:4000 ...'));

app.use(serveStatic(distPath, { redirect: false, cacheControl: false }));
app.use((req, res, next) => {
  const urlPath = req.url.split('?')[0]
  const filePath = `${projectPath}/dist${urlPath}.html`
  if (existsSync(filePath)) {
    res.end(readFileSync(filePath, 'utf-8'))
  } else {
    next()
  }
});
app.listen(4000);

require('fs').writeFileSync('/tmp/ci.pid', process.pid.toString());
