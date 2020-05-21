import React from "react";
import Item from "./Item";
import InternalLink from "../InternalLink";
import {
  calculateVerticalCategory,
  categoryBorder,
  categoryTitleHeight,
  itemMargin, smallItemWidth,
  subcategoryMargin
} from "../../utils/landscapeCalculations";

const VerticalCategory = ({header, subcategories, top, left, width, height, color, href, onSelectItem, fitWidth}) => {
  const subcategoriesWithCalculations = calculateVerticalCategory({ subcategories, fitWidth, width })
  return <div>
    <div style={{
      position: 'absolute', top, left, height, width,  background: color,
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2)',
      padding: categoryBorder,
      display: 'flex',
      flexDirection: 'column'
    }} className="big-picture-section">
      <div style={{ width: '100%', height: categoryTitleHeight, lineHeight: '25px', textAlign: 'center'}}>
        <InternalLink to={href} style={{ color: 'white', fontSize: 12 }}>
          {header}
        </InternalLink>
      </div>
      <div style={{ width: '100%', position: 'relative', flex: 1, padding: `${subcategoryMargin}px 0`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'white' }}>
        {subcategoriesWithCalculations.map(subcategory => {
          const { width, columns } = subcategory
          const style = { display: 'grid', gridTemplateColumns: `repeat(${columns}, ${smallItemWidth}px)` }
          const extraStyle = fitWidth ? { justifyContent: 'space-evenly' } : { gridGap: itemMargin }

          return <div key={subcategory.name} style={{position: 'relative'}}>
            <div style={{ lineHeight: '15px', textAlign: 'center'}}>
              <InternalLink to={subcategory.href} style={{ color: '#282828', fontSize: 11 }}>
                {subcategory.name}
              </InternalLink>
            </div>

            <div style={{width, overflow: 'hidden', margin: '0 auto', ...style, ...extraStyle}}>
              {subcategory.allItems.map(item => <Item item={item} onSelectItem={onSelectItem} key={item.name} fitWidth={fitWidth} />)}
            </div>
          </div>
        })}
      </div>
    </div>
  </div>
}

export default VerticalCategory
