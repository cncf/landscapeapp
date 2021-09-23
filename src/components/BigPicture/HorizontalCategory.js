import React, { Fragment, useContext } from "react";
import { getContrastRatio } from "@material-ui/core/styles";
import css from 'styled-jsx/css'
import Item from "./Item";
import InternalLink from "../InternalLink";
import GuideLink from '../GuideLink'
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
import LandscapeContext from '../../contexts/LandscapeContext'
import SubcategoryInfo from '../SubcategoryInfo'

const Divider = ({ color }) => {
  const width = dividerWidth
  const marginTop = 2 * subcategoryMargin
  const height = `calc(100% - ${2 * marginTop}px)`

  return <div style={{ width, marginTop, height, borderLeft: `${width}px solid ${color}` }}/>
}

const HorizontalCategory = ({ header, subcategories, width, height, top, left, color, href, fitWidth }) => {
  const subcategoriesWithCalculations = calculateHorizontalCategory({ height, width, subcategories, fitWidth })
  const totalRows = Math.max(...subcategoriesWithCalculations.map(({ rows }) => rows))
  const { guideMap } = useContext(LandscapeContext)

  const categoryLink = guideMap[header]
  const subcategoryLinks = (categoryLink && categoryLink.subcategories) || {}
  const backgroundType = getContrastRatio('#ffffff', color) < 4.5 ? 'light' : 'dark'
  const categoryInfo = css.resolve`
    width: ${categoryTitleHeight}px;
    height: ${categoryTitleHeight}px;
    border: 2px solid ${color};
  `

  return (
    <div style={{ width, left, height, top, position: 'absolute' }} className="big-picture-section">
      {categoryInfo.styles}
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
        <div className={`category-header-horizontal category-${backgroundType}-bg`} style={{
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
          <InternalLink to={href} className="category-header-link">{header}</InternalLink>

          { categoryLink &&
            <GuideLink className={`category-header-info ${categoryInfo.className}`} label={header} identifier={categoryLink.identifier} /> }
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
            const { allItems, columns, width, name, href, rows } = subcategory
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
                    allItems.map(item => <Item item={item} key={item.name}/>)
                  }

                  { subcategoryLinks[name] && <SubcategoryInfo label={name} identifier={subcategoryLinks[name].identifier} column={columns} row={totalRows}/> }
                </div>
              </div>

              {lastSubcategory && <Divider color={color}/>}
            </Fragment>
          })}
        </div>
      </div>
    </div>);
}

export default HorizontalCategory
