// allows to read json files from certain directores

module.exports.readJsonFromProject = function(file) {
  const path = require('path').resolve(process.env.PROJECT_PATH, file + '.json');
}

module.exports.readJsonFromDist = function(file) {
  const path = require('path').resolve(process.env.PROJECT_PATH, 'dist', process.env.PROJECT_NAME || '', file + '.json');
}
