const { resolve } = require("path");
const { writeFileSync, readFileSync, existsSync } = require("fs");

const { projectPath } = require('./settings');
const { load } = require("js-yaml");
const { dump } = require("./yaml");

const path = resolve(projectPath, 'processed_landscape.yml');
const processedLandscape = module.exports.processedLandscape = existsSync(path) ? load(readFileSync(path)) : {};
module.exports.updateProcessedLandscape = async callback => {
  const updatedProcessedLandscape = await callback(processedLandscape);
  const newContent = "# THIS FILE IS GENERATED AUTOMATICALLY!\n" + dump(updatedProcessedLandscape);
  writeFileSync(path, newContent);
}
