// This file configures the development web server
// which supports hot reloading and synchronized testing.

// Require Browsersync along with webpack and middleware for it
import browserSync from 'browser-sync';
// Required for react-router browserHistory
// see https://github.com/BrowserSync/browser-sync/issues/204#issuecomment-102623643
import historyApiFallback from 'connect-history-api-fallback';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config.dev';
import { projectPath } from './settings';

const bundler = webpack(config);

// Run Browsersync and use middleware for Hot Module Replacement
browserSync({
  port: 3000,
  ui: {
    port: 3001
  },
  server: {
    baseDir: [projectPath, 'src'], // project first, library second

    middleware: [
      historyApiFallback(),
      function(req, res, next) {
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
      },
      function(req, res, next) {
        if (req.url.match(/^\/logos/)) {
          req.url = req.url.replace('/logos', '/cached_logos');
        }
        if (req.url === '/favicon.png') {
          req.url = '/images/favicon.png';
        }
        next();

      },

      webpackDevMiddleware(bundler, {
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
        },

        // for other settings see
        // https://webpack.js.org/guides/development/#using-webpack-dev-middleware
      }),

      // bundler should be the same as above
      webpackHotMiddleware(bundler)
    ]
  },

  // no need to watch '*.js' here, webpack will take care of it for us,
  // including full page reloads if HMR won't work
  files: [
    'src/*.html'
  ]
});
