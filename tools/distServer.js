// This file configures a web server for testing the production build
// on your local machine.

import browserSync from 'browser-sync';
import path from 'path';
import historyApiFallback from 'connect-history-api-fallback';
import {chalkProcessing} from './chalkConfig';
import { projectPath } from './settings';

/* eslint-disable no-console */

console.log(chalkProcessing('Opening production build...'));

// Run Browsersync
browserSync({
  port: 4000,
  ui: {
    port: 4001
  },
  server: {
    baseDir: path.resolve(projectPath, 'dist')
  },
  middleware: [
    function (req, res, next) {

      const contentPath = path.resolve(projectPath, 'dist', 'prerender.html');
      console.info(contentPath, req.url);
      if (req.url === '/' && require('fs').existsSync(contentPath)) {
          const content = require('fs').readFileSync(contentPath, 'utf-8');
          res.end(content);
      } else {
        next();
      }
    },
    historyApiFallback()
  ]
});
