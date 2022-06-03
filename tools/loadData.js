const path = require('path');
const fs = require('fs');

const { projectPath } = require('./settings');
module.exports.projects =
  JSON.parse(fs.readFileSync(path.resolve(projectPath, 'data.json')));
