import React, { useContext } from "react";
import Item from "./Item";
import InternalLink from "../InternalLink";
import {
  calculateVerticalCategory,
  categoryBorder,
  categoryTitleHeight,
  itemMargin, smallItemWidth,
  subcategoryMargin
} from "../../utils/landscapeCalculations";
import LandscapeContext from '../../contexts/LandscapeContext'
import GuideLink from '../GuideLink'

const VerticalCategory = ({header, subcategories, top, left, width, height, color, href, fitWidth}) => {
  const subcategoriesWithCalculations = calculateVerticalCategory({ subcategories, fitWidth, width })
  const { guideMap } = useContext(LandscapeContext)

  const categoryLink = guideMap[header]
  const subcategoryLinks = (categoryLink && categoryLink.subcategories) || {}

  return <div>
    <div style={{
      position: 'absolute', top, left, height, width,  background: color,
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2)',
      padding: categoryBorder,
      display: 'flex',
      flexDirection: 'column'
    }} className="big-picture-section">
      <div style={{ width: '100%', height: categoryTitleHeight, lineHeight: '25px', textAlign: 'center', position: 'relative'}}>
        <InternalLink to={href} style={{ color: 'white', fontSize: 12 }}>
          {header}
        </InternalLink>

        { categoryLink && <div style={{ position: 'absolute', right: 5, top: 5 }}>
          <GuideLink label={header} color={color} identifier={categoryLink.identifier} />
        </div> }
      </div>
      <div style={{ width: '100%', position: 'relative', flex: 1, padding: `${subcategoryMargin}px 0`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'white' }}>
        {subcategoriesWithCalculations.map(subcategory => {
          const { width, columns, name } = subcategory
          const style = { display: 'grid', gridTemplateColumns: `repeat(${columns}, ${smallItemWidth}px)` }
          const extraStyle = fitWidth ? { justifyContent: 'space-evenly' } : { gridGap: itemMargin }

          return <div key={subcategory.name} style={{position: 'relative'}}>
            <div style={{ lineHeight: '15px', textAlign: 'center'}}>
              <InternalLink to={subcategory.href} style={{ color: '#282828', fontSize: 11 }}>
                {name}
              </InternalLink>

              { subcategoryLinks[name] && <div style={{ position: 'absolute', right: 5, top: -1 }}>
                <GuideLink label={name} identifier={subcategoryLinks[name].identifier} fontSize={16} />
              </div> }
            </div>

            <div style={{width, overflow: 'hidden', margin: '0 auto', ...style, ...extraStyle}}>
              {subcategory.allItems.map(item => <Item item={item} key={item.name} fitWidth={fitWidth} />)}
            </div>
          </div>
        })}
      </div>
    </div>
  </div>
}

export default VerticalCategory
