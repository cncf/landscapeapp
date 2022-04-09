import GuideLink from './GuideLink'
import { smallItemHeight, smallItemWidth } from '../utils/landscapeCalculations'


const SubcategoryInfo = ({ label, anchor, row, column }) => {
  const style={
    width: smallItemWidth,
    height: smallItemHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    gridColumnStart: column || 'auto',
    gridRowStart: row || 'auto'
  };
  return <GuideLink label={label} anchor={anchor} style={style}/>
}

export default SubcategoryInfo;
