const _ = require('lodash');
const path = require('path');

const { projectPath } = require('./settings');
const { dump } = require('./yaml');
const { hasFatalErrors, setFatalError, reportFatalErrors } = require('./fatalErrors');

function hasNonAscii(str) {
    return ! /^[\x00-\x7F]*$/.test(str);
}



async function main() {
  const source = require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const processedSource = require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));

  // fix landscape itself with logos
  _.each(source.landscape, function(category) {
    _.each(category.subcategories, function(subcategory) {
      _.each(subcategory.items, function(item) {
        if (!item.logo) {
          const error = `FATAL: entry ${item.name} is missing a logo`;
          console.info(error);
          setFatalError(error);
        }
        if (item.logo && item.logo.indexOf('/') === -1) {
          const logo = item.logo;
          const processedLogo = _.deburr(logo);
          if (hasNonAscii(processedLogo)) {
            const error = `FATAL: entry ${item.name} has non ascii characters in a logo ${logo}`;
            console.info(error);
            setFatalError(error);
          }
          else if (logo !== processedLogo) {
            item.logo = processedLogo;
            const oldFile = path.resolve(projectPath, 'hosted_logos', logo);
            const newFile = path.resolve(projectPath, 'hosted_logos', processedLogo);
            require('fs').renameSync(oldFile, newFile);
            console.info(`RENAMED: ${logo} => ${processedLogo}`);
          }
        }
      });
    });
  });
  require('fs').writeFileSync(path.resolve(projectPath, 'landscape.yml'), dump(source));
  // fix processed landscape
  _.each(processedSource.landscape, function(category) {
    _.each(category.subcategories, function(subcategory) {
      _.each(subcategory.items, function(item) {
        if (item.image_data) {
          const logo = item.image_data.fileName;
          const processedLogo = _.deburr(logo);
          if (hasNonAscii(processedLogo)) {
            const error = `FATAL: entry ${item.name} has non ascii characters in a logo ${logo}`;
            console.info(error);
            setFatalError(error);
          }
          else if (logo !== processedLogo) {
            item.image_data.fileName = processedLogo;
            const oldFile = path.resolve(projectPath, 'cached_logos', logo);
            const newFile = path.resolve(projectPath, 'cached_logos', processedLogo);
            require('fs').renameSync(oldFile, newFile);
            console.info(`RENAMED: ${logo} => ${processedLogo}`);
          }
        }
      });
    });
  });
  require('fs').writeFileSync(path.resolve(projectPath, 'processed_landscape.yml'), dump(processedSource));
  if (hasFatalErrors()) {
    await reportFatalErrors();
    process.exit(1);
  }
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});
