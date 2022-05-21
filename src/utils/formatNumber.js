const _ = require('lodash');
const formatNumber = require('format-number');
function _formatNumber(v) {
  if (_.isString(v)) {
    return '';
  }
  return formatNumber({integerSeparator: ','})(v);
}
module.exports.formatNumber = _formatNumber;
