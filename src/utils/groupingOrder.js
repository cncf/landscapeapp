const { fields } = require('../types/fields');
const _ = require('lodash');
function groupFn(field) {
  const values = fields[field].answers;
  const sortedValues = _.orderBy(values, 'groupingSortOrder');
  return function(x) {
    return _.findIndex(sortedValues, {id: x});
  }
}
module.exports.groupFn = groupFn;
