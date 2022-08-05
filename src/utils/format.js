module.exports.millify = function(value) {
  let base, suffix;
  if (value < 1000 - 0.05) {
    base = value;
    suffix = '';
  } else if (value < (1000 - 0.05) * 1000) {
    base = value / 1000;
    suffix = 'K';
  } else if (value < (1000 - 0.05) * 1000 * 1000) {
    base = value / 1000 / 1000;
    suffix =  'M';
  } else if (value < (1000 - 0.05) * 1000 * 1000 * 1000) {
    suffix = 'B';
    base = value / 1000 / 1000 / 1000;
  } else {
    suffix = 'T';
    base = value / 1000 / 1000 / 1000 / 1000;
  }
  const digits = base.toFixed(1).replace('.0', '');
  return digits + suffix;
}

module.exports.h = function(html) {
  if (!html) {
    return '';
  }
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return String(html).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
    return entityMap[s];
  });
}
