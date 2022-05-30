const path = require("path");
const fs = require('fs');

const { dump } = require("./yaml");
const { projectPath } = require("./settings");

const landscapePath = path.resolve(projectPath, 'landscape.yml');

module.exports.landscape = require('js-yaml').load(fs.readFileSync(landscapePath));
module.exports.saveLandscape = (newLandscape) => {
  fs.writeFileSync(landscapePath, dump(newLandscape));
}
