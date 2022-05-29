const  _ = require('lodash');
const { paramCase } = require('change-case');
const saneName = module.exports.saneName = function(x) {
  return _.deburr(paramCase(x));
};
