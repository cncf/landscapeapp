const getContrastRatio = require('get-contrast-ratio').default;

const { h } = require('../utils/format');
const { renderGuideLink } = require('./GuideLink');
const { categoryTitleHeight } = require('../utils/landscapeCalculations');

module.exports.renderCategoryHeader = function renderCategoryHeader({ href, label, guideAnchor, background, rotate = false }) {
  const lowContrast = getContrastRatio('#ffffff', background) < 4.5
  const color = lowContrast ? '#282828' : '#ffffff'
  const backgroundColor = lowContrast ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'

  return `
    <a data-type="internal"
       href="${href}"
       style="
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 100%;
        flex: 1;
        font-size: 12px;
        color: ${color};
        background: none
      "
    >${h(label)}</a>
    ${ guideAnchor ? renderGuideLink({label, anchor: guideAnchor, style: `
        width: ${categoryTitleHeight - 4}px;
        height: ${categoryTitleHeight - 4}px;
        margin: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        color: ${color};
        background: ${backgroundColor};
        transform: ${rotate ? 'rotate(180deg)' : 'none' };
      `}) : '' }
  `;
}
