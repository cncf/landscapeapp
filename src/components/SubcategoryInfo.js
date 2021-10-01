import GuideLink from './GuideLink'
import css from 'styled-jsx/css'
import { smallItemHeight, smallItemWidth } from '../utils/landscapeCalculations'


const SubcategoryInfo = ({ label, anchor, row, column }) => {
  const base = css.resolve`
    width: ${smallItemWidth}px;
    height: ${smallItemHeight}px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  `

  const extra = css.resolve`
    grid-column-start: ${column || 'auto'};
    grid-row-start: ${row || 'auto'};
  `

  const className = `${base.className} ${extra.className}`

  return <>
    {base.styles}
    {extra.styles}
    <GuideLink className={className} label={label} anchor={anchor}/>
  </>
}

export default SubcategoryInfo
