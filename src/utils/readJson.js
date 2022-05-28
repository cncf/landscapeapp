// allows to read json files from certain directores

module.exports.readJsonFromProject = function(file) {
  if (global.lookups && global.lookups[file]) {
    return global.lookups[file];
  }
  const path = require('path').resolve(process.env.PROJECT_PATH, file + '.json');
}

module.exports.readJsonFromDist = function(file) {
  if (global.lookups && global.lookups[file]) {
    return global.lookups[file];
  }
  const path = require('path').resolve(process.env.PROJECT_PATH, 'dist', process.env.PROJECT_NAME || '', file + '.json');
}
