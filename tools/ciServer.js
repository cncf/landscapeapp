// This file configures a web server for testing the production build
// on your local machine.

import path from 'path';
import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback';
import {chalkProcessing} from './chalkConfig';
import { projectPath } from './settings';

/* eslint-disable no-console */


console.log(chalkProcessing('running a dist server on http://localhost:4000 ...'));
// Run Browsersync
const result = browserSync({
  port: 4000,
  ui: {
    port: 4001
  },
  open: false,
  server: {
    baseDir: path.resolve(projectPath, 'dist')
  },
  files: [
    'src/*.html'
  ],
  ghostMode: false,
  notify: false,
  middleware: [
    function (req, res, next) {

      const contentPath = path.resolve(projectPath, 'dist', 'prerender.html');
      if (req.url === '/' && require('fs').existsSync(contentPath)) {
          console.info('Serving prerendered content for /');
          const content = require('fs').readFileSync(contentPath, 'utf-8');
          res.end(content);
      } else {
        next();
      }
    },
    historyApiFallback()
  ]
});
require('fs').writeFileSync('/tmp/ci.pid', process.pid.toString());
export default result;
