import _ from 'lodash';
import formatNumber from 'format-number';
export default function _formatNumber(v) {
  if (_.isString(v)) {
    return '';
  }
  return formatNumber({integerSeparator: ','})(v);
}
