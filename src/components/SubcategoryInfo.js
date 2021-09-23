import GuideLink from './GuideLink'
import css from 'styled-jsx/css'
import { smallItemHeight, smallItemWidth } from '../utils/landscapeCalculations'


const SubcategoryInfo = ({ label, identifier, row, column }) => {
  const { styles, className } = css.resolve`
    width: ${smallItemWidth}px;
    height: ${smallItemHeight}px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    grid-column-start: ${column || 'auto'};
    grid-row-start: ${row || 'auto'};
  `

  return <>
    {styles}
    <GuideLink className={className} label={label} identifier={identifier}/>
  </>
}

export default SubcategoryInfo
