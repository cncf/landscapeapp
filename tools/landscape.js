const path = require("path");
const fs = require('fs');

const { dump } = require("./yaml");
const { projectPath } = require("./settings");

const landscapePath = path.resolve(projectPath, 'landscape.yml');

const landscape = module.exports.landscape = require('js-yaml').load(fs.readFileSync(landscapePath));
const saveLandscape = module.exports.saveLandscape = (newLandscape) => {
  fs.writeFileSync(landscapePath, dump(newLandscape));
}
