import React, { Fragment } from "react";
import styled from 'styled-components'
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

const Divider = styled.div`
  width: ${dividerWidth};
  margin-top: ${2 * subcategoryMargin}px;
  height: calc(100% - ${4 * subcategoryMargin}px);
  border-left: ${dividerWidth}px solid ${props => props.color};
`

const Wrapper = styled.div`
  position: absolute;
`

const Header = styled.div`
  position: absolute;
  top: ${subcategoryTitleHeight}px;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
  padding: ${categoryBorder}px;
`

const Title = styled.div`
  top: 5px;
  bottom: 5px;
  left: 0;
  width: ${categoryTitleHeight}px;
  position: absolute;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  a {
    font-size: 12px;
    line-height: 13px;
    color: ${props => props.hasContrast ? '#282828' : '#ffffff'};
  }
`

const Inner = styled.div`
  margin-left: 30px;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  background: white;
`

const Subcategory = styled.div`
  position: relative;
  font-size: 10px;
  overflow: visible;
  padding: ${props => props.fitWidth ? 0 : subcategoryMargin}px 0;
  box-sizing: border-box;
`

const SubcategoryTitle = styled.div`
  position: absolute;
  top: ${-1 * categoryTitleHeight}px;
  left: 0;
  right: 0;
  height: ${categoryTitleHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  a {
    color: white;
    font-size: 11px;
  }
`

const Items = styled.div`
  display: grid;
  height: 100%;
  grid-auto-rows: ${smallItemHeight}px;
  ${props => props.fitWidth ?
      `justify-content: space-evenly; align-content: space-evenly;` :
      `grid-gap: ${itemMargin}px;` }
`

const HorizontalCategory = (({ header, subcategories, width, height, top, left, color, href, onSelectItem, fitWidth }) => {
  const subcategoriesWithCalculations = calculateHorizontalCategory({ height, width, subcategories, fitWidth })

  return (
    <Wrapper style={{width, height, top, left}} className="big-picture-section">
      <Header style={{background: color}}>
        <Title hasContrast={getContrastRatio('#ffffff', color) < 4.5}>
          <InternalLink to={href}>{header}</InternalLink>
        </Title>
        <Inner>
          {subcategoriesWithCalculations.map((subcategory, index) => {
            const lastSubcategory = index !== subcategories.length - 1
            const { allItems, columns, width, name, href } = subcategory

            return <Fragment key={name}>
              <Subcategory style={{ width }} fitWidth={fitWidth}>
                <SubcategoryTitle>
                  <InternalLink to={href}>{name}</InternalLink>
                </SubcategoryTitle>
                <Items fitWidth={fitWidth} style={{ gridTemplateColumns: `repeat(${columns}, ${smallItemWidth}px)`}}>
                  {
                    allItems.map(item => <Item item={item} onSelectItem={onSelectItem} key={item.name}/>)
                  }
                </Items>
              </Subcategory>

              {lastSubcategory && <Divider color={color}/>}
            </Fragment>
          })}
        </Inner>
      </Header>
    </Wrapper>);
});

export default HorizontalCategory
