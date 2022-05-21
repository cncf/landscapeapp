const _ = require('lodash');

function pack(records) {
  const keys = _.uniq(_.flatten(_.map(records, (x) => _.keys(x))));
  const compact = _.map( records,  (x) => _.map(keys, (key) => x[key] || '!E'));
  return [keys].concat(compact);
}
module.exports.pack = pack;
