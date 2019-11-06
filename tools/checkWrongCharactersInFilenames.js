import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import { projectPath, settings } from './settings';

import { hasFatalErrors, setFatalError, reportFatalErrors } from './fatalErrors';

function hasNonAscii(str) {
    return ! /^[\x00-\x7F]*$/.test(str);
}



async function main() {
  const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const processedSource = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));

  // fix landscape itself with logos
  _.each(source.landscape, function(category) {
    _.each(category.subcategories, function(subcategory) {
      _.each(subcategory.items, function(item) {
        if (item.logo.indexOf('/') === -1) {
          const logo = item.logo;
          const processedLogo = _.deburr(logo);
          if (hasNonAscii(processedLogo)) {
            const error = `FATAL: entry ${item.name} has non ascii characters in a logo ${logo}`;
            console.info(error);
            setFatalError(error);
          }
          else if (logo !== processedLogo) {
            const error = `FATAL: please rename ${logo} to ${processedLogo}`;
            console.info(error);
            setFatalError(error);
          }
        }
      });
    });
  });
  if (hasFatalErrors()) {
    await reportFatalErrors();
    process.exit(1);
  }
}
main().catch(function(ex) {
  console.info(ex);
  process.exit(1);
});
