const  _ = require('lodash');
const { paramCase } = require('change-case');
module.exports.saneName = function(x) {
  return _.deburr(paramCase(x.replace(/\s/g,'spaceseparator')).replaceAll('spaceseparator', '-'));
};
