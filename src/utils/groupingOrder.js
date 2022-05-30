const { fields } = require('../types/fields');
const _ = require('lodash');
module.exports.groupingOrder = function(field) {
  const values = fields[field].answers;
  const sortedValues = _.orderBy(values, 'groupingSortOrder');
  return function(x) {
    return _.findIndex(sortedValues, {id: x});
  }
}
