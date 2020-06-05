// This file configures a web server for testing the production build
// on your local machine.
import open from 'open';
import path from 'path';
import historyApiFallback from 'connect-history-api-fallback';
import {chalkProcessing} from './chalkConfig';
import { projectPath } from './settings';
const app = require('connect')();
const serveStatic = require('serve-static');
console.log(chalkProcessing('running a dist server on http://localhost:4000 ...'));
app.use(function (req, res, next) {
  const contentPath = path.resolve(projectPath, 'dist', 'prerender.html');
  if (req.url === '/' && require('fs').existsSync(contentPath)) {
    console.info('Serving prerendered content for /');
    const content = require('fs').readFileSync(contentPath, 'utf-8');
    res.end(content);
  } else {
    next();
  }
});
app.use(serveStatic(path.resolve(projectPath, 'dist')));
app.use(historyApiFallback());
app.use(function(req, res) {
  res.end(require('fs').readFileSync(path.resolve(projectPath, 'dist', 'index.html')));
});
app.listen(4000);
open('http://localhost:4000');
