const { h } = require('../utils/format');
const { guideLink } = require('../utils/icons');
module.exports.renderGuideLink = function({anchor, label, style }) {
  const ariaLabel = `Read more about ${label} on the guide`
  const to = `guide#${anchor}`;

  return `<a data-type="external" target="_blank" style="${style}" aria-label="${h(ariaLabel)}">
    ${guideLink}
  </a>`;
}
