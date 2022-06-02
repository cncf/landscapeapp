// allows to read json files from certain directores

module.exports.readJsonFromProject = function(file) {
  if (global.lookups) {
    if (global.lookups[file]) {
      return global.lookups[file];
    } else {
      throw ('Can not read ', file);
    }
  }
  const fullPath = require('path').resolve(process.env.PROJECT_PATH, file + '.json');
  return JSON.parse(require('fs').readFileSync(fullPath, 'utf-8'));
}

module.exports.readJsonFromDist = function(file) {
  if (global.lookups && global.lookups[file]) {
    return global.lookups[file];
  }
  const fullPath = require('path').resolve(process.env.PROJECT_PATH, 'dist', process.env.PROJECT_NAME || '', file + '.json');
  return JSON.parse(require('fs').readFileSync(fullPath, 'utf-8'));
}
