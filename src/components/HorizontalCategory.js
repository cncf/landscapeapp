import React, { Fragment, useContext } from "react";
import Item from "./Item";

const InternalLink = ({to, className, children}) =>
  (<a data-type="internal" href={to} className={className}>{children}</a>)

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
} from "../utils/landscapeCalculations";
import SubcategoryInfo from './SubcategoryInfo'
import CategoryHeader from './CategoryHeader'

const Divider = ({ color }) => {
  const width = dividerWidth
  const marginTop = 2 * subcategoryMargin
  const height = `calc(100% - ${2 * marginTop}px)`

  return <div style={{ width, marginTop, height, borderLeft: `${width}px solid ${color}` }}/>
}

const HorizontalCategory = ({ header, guideInfo, subcategories, width, height, top, left, color, href, fitWidth }) => {
  const addInfoIcon = !!guideInfo;
  const subcategoriesWithCalculations = calculateHorizontalCategory({ height, width, subcategories, fitWidth, addInfoIcon })
  const totalRows = Math.max(...subcategoriesWithCalculations.map(({ rows }) => rows))

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
          top: 0,
          bottom: 0,
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
          <CategoryHeader href={href} label={header} guideAnchor={guideInfo} background={color} rotate={true} />
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
            const { allItems, guideInfo, columns, width, name, href } = subcategory
            const padding = fitWidth ? 0 : `${subcategoryMargin}px 0`
            const style = {
              display: 'grid',
              height: '100%',
              gridTemplateColumns: `repeat(${columns}, ${smallItemWidth}px)`,
              gridAutoRows: `${smallItemHeight}px`
            }
            const extraStyle = fitWidth ? { justifyContent: 'space-evenly', alignContent: 'space-evenly' } : { gridGap: itemMargin }
            const path = [header, name].join(' / ')

            return <Fragment key={name}>
              <div style={{
                width,
                position: 'relative',
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
                  <InternalLink to={href} className="white-link">{name}</InternalLink>
                </div>
                <div style={{...style, ...extraStyle}}>
                  {
                    allItems.map(item => <Item item={item} key={item.name}/>)
                  }

                  { guideInfo && <SubcategoryInfo label={name} anchor={guideInfo} column={columns} row={totalRows}/> } </div>
              </div>

              {lastSubcategory && <Divider color={color}/>}
            </Fragment>
          })}
        </div>
      </div>
    </div>);
}

export default HorizontalCategory
