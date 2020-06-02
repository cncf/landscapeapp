// This file configures the development web server
// which supports hot reloading and synchronized testing.

import request from 'request-promise';
import path from 'path';
import historyApiFallback from 'connect-history-api-fallback';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config.dev';
import { projectPath } from './settings';

const bundler = webpack(config);
const app = require('express')();
const serveStatic = require('serve-static');


// app.use(historyApiFallback);

app.use(function(req, res, next) {
  if (req.url.match(/iframeResizer.js/)) {
    const path = require('path');
    const fs = require('fs');
    const fileContent1 = (function() {
      try {
        return fs.readFileSync(path.resolve(__dirname, '../node_modules/iframe-resizer/js/iframeResizer.min.js'), 'utf-8');
      } catch(ex) {
        console.info(ex.message);
        return fs.readFileSync(path.resolve(projectPath, 'node_modules/iframe-resizer/js/iframeResizer.min.js'), 'utf-8');
      }
    })();
    const fileContent2 = require('fs').readFileSync(path.resolve(__dirname, '../src/iframeResizer.js'), 'utf-8');
    res.end(fileContent1 + '\n' + fileContent2);
  } else {
    next();
  }
})

app.use(function(req, res, next) {
  if (req.url.match(/^\/logos/)) {
    req.url = req.url.replace('/logos', '/cached_logos');
  }
  if (req.url === '/favicon.png') {
    req.url = '/images/favicon.png';
  }
  next();
});

app.use(webpackDevMiddleware(bundler, {
        // Dev middleware can't access config, so we provide publicPath
        publicPath: config.output.publicPath,

        // These settings suppress noisy webpack output so only errors are displayed to the console.
        noInfo: true,
        quiet: false,
        stats: {
          assets: false,
          colors: true,
          version: false,
          hash: false,
          timings: false,
          chunks: false,
          chunkModules: false
        }
}))
app.use(webpackHotMiddleware(bundler));
app.use(serveStatic(projectPath));
app.use(serveStatic('src'));
app.use(function(req, res) {
  request.get('http://localhost:3000/').then(function(result) {
    console.info('serving the result');
    res.end(result);
  });
});
app.listen(3000);
console.info(`Server is running on http://localhost:3000`);
