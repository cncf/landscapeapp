const { fields } = require('../types/fields');
const  _ = require('lodash');

function groupingLabel(field, id) {
  const values = fields[field].answers;
  const valueInfo = _.find(values, {id: id});
  return valueInfo.groupingLabel;
}
module.exports.groupingLabel = groupingLabel;
