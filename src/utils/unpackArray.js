const _ = require('lodash');

const unpack = module.exports.unpack = function(records) {
  const keys = records[0];
  const compact = records.slice(1);
  const result = _.map(compact, (arr) => _.fromPairs(_.map(arr, (el, index) => [keys[index], el]).filter( (x) => x[1] !== '!E')));
  return result;
}
