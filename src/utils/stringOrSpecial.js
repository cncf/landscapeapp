module.exports.stringOrSpecial = function(x) {
  if (x === 'true') {
    return true;
  }
  if (x === 'false') {
    return false;
  }
  if (x === 'null') {
    return null;
  }
  return x;
}
