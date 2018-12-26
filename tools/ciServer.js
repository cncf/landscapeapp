// This file configures a web server for testing the production build
// on your local machine.

import path from 'path';
import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback';
import connect from 'connect';
import serveStatic from 'serve-static';
import {chalkProcessing} from './chalkConfig';
import { projectPath } from './settings';

/* eslint-disable no-console */



console.log(chalkProcessing('running a dist server on http://localhost:4000 ...'));
const app = connect();
app.use(serveStatic(path.resolve(projectPath, 'dist')));
app.use(function(req, res, next) {
  res.url = '/index.html';
  next();
});
app.use(serveStatic(path.resolve(projectPath, 'dist')));
app.listen(4000);
require('fs').writeFileSync('/tmp/ci.pid', process.pid);
