const path = require('path')
const { readFileSync } = require('fs')
const { safeLoad } = require('js-yaml')

if (!process.env.PROJECT_PATH) {
  console.info('NOTE: the PROJECT_PATH env variable is not set. Please point it to the cncf, lfai or other landscape repo');
  process.env.PROJECT_PATH = path.resolve('../..');
  console.info('Using: ', process.env.PROJECT_PATH);
}

const projectPath = process.env.PROJECT_PATH
const settingsPath = path.resolve(projectPath, 'settings.yml')
const settings = JSON.stringify(safeLoad(readFileSync(settingsPath)))

const lookupsPath =  path.resolve(projectPath, 'lookup.json')
const lookups = readFileSync(lookupsPath, 'utf-8')

const lastUpdated = new Date().toISOString().substring(0, 19).replace('T', ' ') + 'Z'

const processedLandscape =  safeLoad(readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
const tweets = (processedLandscape.twitter_options || {}).count || 0

const GA = process.env.GA

const basePath = process.env.PROJECT_NAME ? `/${process.env.PROJECT_NAME}` : ''

module.exports = {
  env: { settings, lookups, lastUpdated, tweets, GA, basePath },
  basePath,
  webpack: (config, options) => {
    config.module.rules.push(      {
      test: /\.jsx?$/,
      exclude: /node_modules\/(?!(interactive-landscape)\/).*/,
      use: [{
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: ['@babel/preset-env', 'next/babel'],
          plugins: [
            "@babel/plugin-proposal-class-properties"
          ]
        }
      }]
    })

    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   'lodash.clonedeep': 'lodash/cloneDeep.js',
    //   'lodash.set': 'lodash/set.js',
    //   'lodash.get': 'lodash/get.js',
    //   'current-device': 'current-device/es',
    //   'react-redux': 'react-redux/es',
    //   'react-router-redux': 'react-router-redux/es',
    //   'redux-thunk': 'redux-thunk/es',
    //   'reselect': 'reselect/es',
    // }

    return config
  },
}
