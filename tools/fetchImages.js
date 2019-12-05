import { setFatalError } from './fatalErrors';
import colors from 'colors';
import rp from './rpRetry';
import Promise from 'bluebird';
import saneName from '../src/utils/saneName';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { settings, projectPath } from './settings';
import makeReporter from './progressReporter';
import { addError, addWarning } from './reporter';
import autoCropSvg from 'svg-autocrop';
const debug = require('debug')('images');

const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;

const traverse = require('traverse');

async function getLandscapeItems() {
  const source =  require('js-yaml').safeLoad(fs.readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const tree = traverse(source);
  const items = [];
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.item !== null) {
      return;
    }
    items.push({logo: node.logo, name: node.name, organization: node.organization});
  });
  _.each(items, function(item) {
    const id = item.name;
    item.id = id;
  });
  return items;
}

export async function extractSavedImageEntries() {
  const traverse = require('traverse');
  let source = [];
  try {
    source =  require('js-yaml').safeLoad(fs.readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
  } catch(_ex) {
    console.info('Cannot extract image entries from the processed_landscape.yml');
  }

  var images = [];
  const tree = traverse(source);
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.image_data) {
      images.push({...node.image_data,name: node.name, logo: node.logo});
    }
  });

  return _.uniq(images);
}



function imageExist(entry) {
  const fileName = path.resolve(projectPath,  './cached_logos/' + entry.fileName) ;
  return require('fs').existsSync(fileName);
}

function getItemHash(item) {
  if (item.logo && item.logo.indexOf('http://') !== 0 && item.logo.indexOf('https://') !== 0) {
    // console.info(item.logo);
    const response = fs.readFileSync(path.resolve(projectPath, 'hosted_logos',  item.logo));
    return require('crypto').createHash('sha256').update(response).digest('base64');
  }
  return;
}

export async function fetchImageEntries({cache, preferCache}) {
  const items = await getLandscapeItems();
  const errors = [];
  const reporter = makeReporter();
  const result = await Promise.map(items, async function(item) {
    let cachedEntry;
    let url = item.logo;
    try {
      const hash = getItemHash(item);
      const searchOptions = {logo: item.logo, name: item.name};
      if (hash) {
        searchOptions.hash = hash;
      }
      // console.info(searchOptions);
      cachedEntry = _.find(cache, searchOptions);
      if (preferCache && cachedEntry && imageExist(cachedEntry)) {
        debug(`Found cached entry for ${item.name} with logo ${item.logo}`);
        reporter.write('.');
        return cachedEntry;
      }
      debug(`Fetching data for ${item.name} with logo ${item.logo}`);
      if (url && url.indexOf('//github.com/') !== -1) {
        url = url.replace('github.com', 'raw.githubusercontent.com');
        url = url.replace('blob/', '');
      }
      if (!url) {
        return null;
      }
      const extWithQuery = url.split('.').slice(-1)[0];
      var ext='.' + extWithQuery.split('?')[0];
      var outputExt = '';
      if (['.jpg', '.png', '.gif'].indexOf(ext) !== -1 ) {
        setFatalError(`${item.name}: Only svg logos are supported`);
        errors.push(fatal(`${item.name}: Only svg logos are supported`));
        return null;
      }

      outputExt = '.svg';
      const fileName = `${saneName(item.id)}${outputExt}`;
      var response = null;
      if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
        if (fs.readdirSync(path.resolve(projectPath, 'hosted_logos')).indexOf(url) === -1) {
          throw new Error(`there is no file ${url} in a hosted_logos folder`);
        }
        response = fs.readFileSync(path.resolve(projectPath, 'hosted_logos', url));
      } else {
        response = await rp({
          encoding: null,
          uri: url,
          followRedirect: true,
          maxRedirects: 5,
          simple: true,
          timeout: 30 * 1000
        });
      }
      const croppedSvgResult = await autoCropSvg(response, {title: `${item.name} logo`});
      const croppedSvg = croppedSvgResult.result;
      require('fs').writeFileSync(path.resolve(projectPath, `cached_logos/${fileName}`), croppedSvg);
      reporter.write(cacheMiss('*'));
      return {
        fileName: fileName,
        name: item.name,
        logo: item.logo,
        hash: hash
      };
    } catch(ex) {
      debug(`Cannot fetch ${url}`);
      const message = ex.message || ex || 'Unknown error';
      if (cachedEntry && imageExist(cachedEntry)) {
        addWarning('image');
        reporter.write(error('E'));
        errors.push(error(`Using cached entry, because ${item.name} has issues with logo: ${url}, ${message}`));
        return cachedEntry;
      } else {
        addError('image');
        setFatalError(`No cached entry, and ${item.name} has issues with logo: ${url}, ${message}`);
        reporter.write(fatal('F'));
        errors.push(fatal(`No cached entry, and ${item.name} has issues with logo: ${url}, ${message}`));
        return null;
      }
    }
  }, {concurrency: 5});
  reporter.summary();
  _.each(errors, function(error) {
    console.info('error: ', error);
  });
  return {
    imageEntries: result,
    imageErrors: errors
  }
}

export function removeNonReferencedImages(imageEntries) {
  const existingFiles = fs.readdirSync(path.resolve(projectPath, 'cached_logos'));
  const allowedFiles = imageEntries.filter( (e) => !!e).map( (e) => e.fileName );
  _.each(existingFiles, function(existingFile) {
    if (allowedFiles.indexOf(existingFile) === -1){
      fs.unlinkSync(path.resolve(projectPath,  './cached_logos/' + existingFile));
    }
  })
}
