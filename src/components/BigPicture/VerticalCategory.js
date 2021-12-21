import React, { useContext } from "react";
import Item from "./Item";
import InternalLink from "../InternalLink";
import {
  calculateVerticalCategory,
  categoryTitleHeight,
  itemMargin, smallItemWidth,
  subcategoryMargin
} from "../../utils/landscapeCalculations";
import LandscapeContext from '../../contexts/LandscapeContext'
import SubcategoryInfo from '../SubcategoryInfo'
import CategoryHeader from '../CategoryHeader'

const VerticalCategory = ({header, subcategories, top, left, width, height, color, href, fitWidth}) => {
  const subcategoriesWithCalculations = calculateVerticalCategory({ subcategories, fitWidth, width })
  const { guideIndex } = useContext(LandscapeContext)

  return <div>
    <div style={{
      position: 'absolute', top, left, height, width,  background: color,
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2)',
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }} className="big-picture-section">
      <div style={{ height: categoryTitleHeight, width: '100%', display: 'flex' }}>
        <CategoryHeader href={href} label={header} guideAnchor={guideIndex && guideIndex[header]} background={color} />
      </div>
      <div style={{ width: '100%', position: 'relative', flex: 1, padding: `${subcategoryMargin}px 0`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'white' }}>
        {subcategoriesWithCalculations.map(subcategory => {
          const { width, columns, name } = subcategory
          const style = { display: 'grid', gridTemplateColumns: `repeat(${columns}, ${smallItemWidth}px)` }
          const extraStyle = fitWidth ? { justifyContent: 'space-evenly', flex: 1 } : { gridGap: itemMargin }
          const path = [header, name].join(' / ')

          return <div key={subcategory.name} style={{position: 'relative', flexGrow: subcategory.rows, display: 'flex', flexDirection: 'column' }}>
            <div style={{ lineHeight: '15px', textAlign: 'center'}}>
              <InternalLink to={subcategory.href}>{name}</InternalLink>
            </div>

            <div style={{width, overflow: 'hidden', margin: '0 auto', ...style, ...extraStyle}}>
              {subcategory.allItems.map(item => <Item item={item} key={item.name} fitWidth={fitWidth} />)}

              { guideIndex && guideIndex[path] && <SubcategoryInfo label={name} anchor={guideIndex && guideIndex[path]} column={columns}/> }
            </div>
          </div>
        })}
      </div>
    </div>
  </div>
}

export default VerticalCategory
