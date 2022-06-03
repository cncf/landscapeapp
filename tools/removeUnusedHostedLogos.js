const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const { projectPath} = require('./settings');

module.exports.removeNonReferencedImages = function(imageEntries) {
  const existingFiles = fs.readdirSync(path.resolve(projectPath, './cached_logos'));
  const allowedFiles = imageEntries.filter( (e) => !!e).map( (e) => e.fileName );
  _.each(existingFiles, function(existingFile) {
    if (allowedFiles.indexOf(existingFile) === -1){
      fs.unlinkSync(path.resolve(projectPath, './hosted_logos/' + existingFile));
    }
  })
}
