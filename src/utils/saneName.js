const  _ = require('lodash');
const { paramCase } = require('change-case');
let hash = {};
module.exports.saneName = function(x) {
  let result = _.deburr(paramCase(x));
  if (hash[result] && hash[result] !== x) {
    result = result + '-2';
    console.info(`Hash for ${x} is ${result}`);
  }
  hash[result] = x;
  return result;
};
