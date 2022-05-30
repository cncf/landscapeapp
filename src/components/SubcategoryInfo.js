const { renderGuideLink } = require('./GuideLink');
const { smallItemHeight, smallItemWidth } = require('../utils/landscapeCalculations');

module.exports.renderSubcategoryInfo = function({ label, anchor, row, column }) {
  const style=`
    width: ${smallItemWidth}px;
    height: ${smallItemHeight}px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    grid-column-start: ${column || 'auto'};
    grid-row-start: ${row || 'auto'};
  `;
  return renderGuideLink({label: label, anchor: anchor, style: style})
}
