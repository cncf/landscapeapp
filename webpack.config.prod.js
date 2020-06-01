// For info about this file refer to webpack and webpack-hot-middleware documentation
// For info on how we're generating bundles with hashed filenames for cache busting: https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.w99i89nsz
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
import {projectPath, settings} from './tools/settings';

const source =  require('js-yaml').safeLoad(require('fs').readFileSync(require('path').resolve(projectPath, 'processed_landscape.yml')));
const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  'process.env.GA': require('process').env['GA'],
  'window.possiblePrefix': JSON.stringify(process.env.PROJECT_NAME || ''),
  'window.tweets': (source.twitter_options || {}).count || 0,
  __DEV__: false
};

export default {
  performance: {
     maxEntrypointSize: 800000,
     maxAssetSize: 800000
   },
  stats: {
    entrypoints: false,
    children: false
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
    alias: {
      // for a smaller bundle size
      // '@material-ui/core': '@material-ui/core/es',
      'lodash.clonedeep': 'lodash/cloneDeep.js',
      'lodash.set': 'lodash/set.js',
      'lodash.get': 'lodash/get.js',
      'current-device': 'current-device/es',
      'react-redux': 'react-redux/es',
      'react-router-redux': 'react-router-redux/es',
      'redux-thunk': 'redux-thunk/es',
      'reselect': 'reselect/es',

      // for an upstream/downastream setup
      'project': path.resolve(projectPath),
      'favicon.png': path.resolve(projectPath, 'images/favicon.png'),
    }
  },
  externals: {
    moment: 'moment'
  },
  devtool: 'source-map', // more info:https://webpack.js.org/guides/production/#source-mapping and https://webpack.js.org/configuration/devtool/
  entry: path.resolve(__dirname, 'src/index.js'),
  target: 'web',
  mode: 'production',
  output: {
    path: path.resolve(projectPath, 'dist'),
    publicPath: './',
    filename: '[name].[contenthash].js'
  },
  optimization: {
    minimizer: [new TerserPlugin({ sourceMap: true, parallel: true, terserOptions: {ecma: 7}})]
  },
  plugins: [
    new BundleAnalyzerPlugin({analyzerMode: 'static', openAnalyzer: false}),
    // Hash the files using MD5 so that their names change when the content changes.
    new webpack.DefinePlugin(GLOBALS),

    // Generate an external css file with a hash in the filename
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new webpack.NoEmitOnErrorsPlugin(),

    // Generate HTML file that contains references to generated bundles. See here for how this works: https://github.com/ampedandwired/html-webpack-plugin#basic-usage
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.ejs'),
      favicon: path.resolve(projectPath, './images/favicon.png'),
      minify: false,
      inject: true,
      // custom properties
      GA :require('process').env['GA'],
      prefix: process.env.PROJECT_NAME || '',
      lastUpdated: new Date().toISOString().substring(0, 19).replace('T', ' ') + 'Z',
      settings: settings
    }),
    // Generate manifest and logos
    new FaviconsWebpackPlugin({
        logo: path.resolve(projectPath, 'images/favicon.png'),
        prefix: '',
        favicons: {
          appName: settings.global.name,
          icons: {
            appleIcon: false,
            appleStartup: false,
            firefox: false,
            coast: false,
            windows: false,
            yandex: false
          }
        }
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        sideEffects: false,
        exclude: /node_modules\/(?!(interactive-landscape)\/).*/,
        use: [{
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['@babel/preset-env', {modules: false, targets: '>1%'}],
               '@babel/preset-react'
            ],
            plugins: [
              "lodash",
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-transform-react-constant-elements",
              "transform-react-remove-prop-types",
              "@babel/plugin-transform-runtime",
              "@babel/plugin-transform-async-to-generator",
              "@babel/plugin-transform-regenerator",
              "@babel/plugin-proposal-export-default-from",
            ]
          }
        }]
      },
      {
        test: /\.yml$/,
        use: [{
          loader: 'json-loader'
        }, {
          loader: 'yaml-loader'
        }]
      },
      {
        test: /\.ejs$/, loader: 'ejs-loader',
      },
      {
        test: /\.eot(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/font-woff',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/octet-stream',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'image/svg+xml',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /(\.css|\.scss|\.sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('cssnano'),
                require('autoprefixer'),
              ],
              sourceMap: true
            }
          }, {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.resolve(__dirname, 'src', 'scss')]
              },
              sourceMap: true
            }
          }
        ]
      }
    ]
  }

};
