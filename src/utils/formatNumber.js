const _ = require('lodash');
const _formatNumber = require('format-number');
const formatNumber = module.exports.formatNumber = function(v) {
  if (_.isString(v)) {
    return '';
  }
  return _formatNumber({integerSeparator: ','})(v);
}
