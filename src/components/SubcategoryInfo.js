import guideLink from './GuideLink'
import { h } from '../utils/format';
import { smallItemHeight, smallItemWidth } from '../utils/landscapeCalculations'


export function renderSubcategoryInfo ({ label, anchor, row, column }) {
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
