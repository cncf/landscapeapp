const colors = require('colors');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const autoCropSvg = require('svg-autocrop');
const traverse = require('traverse');

require('./suppressAnnoyingWarnings');
const { saneName } = require('../src/utils/saneName');
const { projectPath } = require('./settings');
const { errorsReporter } = require('./reporter');
const { makeReporter } = require('./progressReporter');
const { retry } = require("./retry");
const debug = require('debug')('images');

const { addFatal, addError } = errorsReporter('image');
const error = colors.red;
const fatal = (x) => colors.red(colors.inverse(x));
const cacheMiss = colors.green;


async function getLandscapeItems() {
  const source =  require('js-yaml').load(fs.readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const tree = traverse(source);
  const items = [];
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.item !== null) {
      return;
    }
    saneName(node.name);
    items.push({logo: node.logo, name: node.name, organization: node.organization});
  });
  _.each(items, function(item) {
    const id = item.name;
    item.id = id;
  });
  return items;
}

module.exports.extractSavedImageEntries =  async function() {
  const traverse = require('traverse');
  let source = [];
  try {
    source =  require('js-yaml').load(fs.readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
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

module.exports.fetchImageEntries =  async function({cache, preferCache}) {
  const items = await getLandscapeItems();
  const errors = [];
  const fatalErrors = [];
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
      if (!url) {
        return null;
      }
      const extWithQuery = url.split('.').slice(-1)[0];
      var ext='.' + extWithQuery.split('?')[0];
      var outputExt = '';
      if (['.jpg', '.png', '.gif'].indexOf(ext) !== -1 ) {
        fatalErrors.push(`${item.name}: Only svg logos are supported`);
        return null;
      }

      outputExt = '.svg';
      let fileNamePart = saneName(item.id);
      if (!fileNamePart) {
        fileNamePart = require('crypto').createHash('md5').update(item.id).digest('hex');
      }
      const fileName = `${fileNamePart}${outputExt}`;
      var response = null;
      if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
        if (fs.readdirSync(path.resolve(projectPath, 'hosted_logos')).indexOf(url) === -1) {
          throw new Error(`there is no file ${url} in a hosted_logos folder`);
        }
        response = fs.readFileSync(path.resolve(projectPath, 'hosted_logos', url));
      } else {
        fatalErrors.push(`We do not support urls for images anymore. Please download the image and put it into the hosted_logos folder, then put its name to the logo field`);
        return null;
        // response = await rp({
          // encoding: null,
          // uri: url,
          // followRedirect: true,
          // maxRedirects: 5,
          // simple: true,
          // timeout: 30 * 1000
        // });
      }
      const croppedSvgResult = await retry(() => autoCropSvg(response, {title: `${item.name} logo`}), 2, 1000);
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
        reporter.write(error('E'));
        errors.push(`Using cached entry, because ${item.name} has issues with logo: ${url}, ${message}`);
        return cachedEntry;
      } else {
        reporter.write(fatal('F'));
        fatalErrors.push(`No cached entry, and ${item.name} has issues with logo: ${url}, ${message}`);
        return null;
      }
    }
  }, {concurrency: 1 });
  reporter.summary();
  _.each(errors, function(error) { addError(error) });
  _.each(fatalErrors, function(error) { addFatal(error) });
  return {
    imageEntries: result,
    imageErrors: errors
  }
}

module.exports.removeNonReferencedImages = function(imageEntries) {
  const existingFiles = fs.readdirSync(path.resolve(projectPath, 'cached_logos'));
  const allowedFiles = imageEntries.filter( (e) => !!e).map( (e) => e.fileName );
  _.each(existingFiles, function(existingFile) {
    if (allowedFiles.indexOf(existingFile) === -1){
      fs.unlinkSync(path.resolve(projectPath,  './cached_logos/' + existingFile));
    }
  })
}
