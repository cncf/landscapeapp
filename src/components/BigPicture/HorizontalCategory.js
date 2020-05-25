import React, { Fragment } from "react";
import { getContrastRatio } from "@material-ui/core/styles";
import Item from "./Item";
import InternalLink from "../InternalLink";
import {
  calculateHorizontalCategory,
  categoryBorder,
  categoryTitleHeight,
  dividerWidth,
  itemMargin,
  smallItemWidth,
  smallItemHeight,
  subcategoryMargin,
  subcategoryTitleHeight
} from "../../utils/landscapeCalculations";

const Divider = (({ color }) => {
  const width = dividerWidth
  const marginTop = 2 * subcategoryMargin
  const height = `calc(100% - ${2 * marginTop}px)`

  return <div style={{ width, marginTop, height, borderLeft: `${width}px solid ${color}` }}/>
})

const HorizontalCategory = (({ header, subcategories, width, height, top, left, color, href, onSelectItem, fitWidth }) => {
  const subcategoriesWithCalculations = calculateHorizontalCategory({ height, width, subcategories, fitWidth })

  return (
    <div style={{ width, left, height, top, position: 'absolute' }} className="big-picture-section">
      <div
        style={{
          position: 'absolute',
          background: color,
          top: subcategoryTitleHeight,
          bottom: 0,
          left: 0,
          right: 0,
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2)',
          padding: categoryBorder
        }}
      >
        <div style={{
          top: 5,
          bottom: 5,
          left: 0,
          width: categoryTitleHeight,
          position: 'absolute',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <InternalLink to={href} style={{
            color: getContrastRatio('#ffffff', color) < 4.5 ? '#282828' : '#ffffff',
            fontSize: 12,
            lineHeight: '13px'
          }}>
            {header}
          </InternalLink>
        </div>
        <div style={{
          marginLeft: 30,
          height: '100%',
          display: 'flex',
          justifyContent: 'space-evenly',
          background: 'white'
        }}>
          {subcategoriesWithCalculations.map((subcategory, index) => {
            const lastSubcategory = index !== subcategories.length - 1
            const { allItems, columns, width, name, href } = subcategory
            const padding = fitWidth ? 0 : `${subcategoryMargin}px 0`
            const style = {
              display: 'grid',
              height: '100%',
              gridTemplateColumns: `repeat(${columns}, ${smallItemWidth}px)`,
              gridAutoRows: `${smallItemHeight}px`
            }
            const extraStyle = fitWidth ? { justifyContent: 'space-evenly', alignContent: 'space-evenly' } : { gridGap: itemMargin }

            return <Fragment key={name}>
              <div style={{
                width,
                position: 'relative',
                fontSize: 10,
                overflow: 'visible',
                padding,
                boxSizing: 'border-box'
              }}>
                <div style={{
                  position: 'absolute',
                  top: -1 * categoryTitleHeight,
                  left: 0,
                  right: 0,
                  height: categoryTitleHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>
                  <InternalLink to={href} style={{ color: 'white', fontSize: 11 }}>{name}</InternalLink>
                </div>
                <div style={{...style, ...extraStyle}}>
                  {
                    allItems.map(item => <Item item={item} onSelectItem={onSelectItem} key={item.name}/>)
                  }
                </div>
              </div>

              {lastSubcategory && <Divider color={color}/>}
            </Fragment>
          })}
        </div>
      </div>
    </div>);
});

export default HorizontalCategory
