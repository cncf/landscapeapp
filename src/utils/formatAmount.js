const _ = require('lodash');
const formatNumber = require('format-number');
const formatAmount = module.exports.formatAmount = function(v) {
  if (_.isString(v)) {
    return v;
  }
  const number = formatNumber({integerSeparator: ','});
  if (v < 1000000) {
    return '$' + number(Math.round(v / 1000)) + 'K';
  } else {
    return '$' + number(Math.round(v / 1000 / 1000)) + 'M';
  }
}
