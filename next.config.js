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

module.exports = {
  env: { settings, lookups, lastUpdated, tweets, GA }
}
