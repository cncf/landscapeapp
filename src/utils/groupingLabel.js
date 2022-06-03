const { fields } = require('../types/fields');
const  _ = require('lodash');

module.exports.groupingLabel = function(field, id) {
  const values = fields[field].answers;
  const valueInfo = _.find(values, {id: id});
  return valueInfo.groupingLabel;
}
