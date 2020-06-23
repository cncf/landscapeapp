import React from "react";
import styled from 'styled-components'
import Item from "./Item";
import InternalLink from "../InternalLink";
import {
  calculateVerticalCategory,
  categoryBorder,
  categoryTitleHeight,
  itemMargin, smallItemWidth,
  subcategoryMargin
} from "../../utils/landscapeCalculations";

const Wrapper = styled.div`
  position: absolute;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
  padding: ${categoryBorder}px;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  width: 100%;
  height: ${categoryTitleHeight}px; 
  line-height: 25px; 
  text-align: center;

  a {
    color: white;
    font-size: 12px;
  }
`

const Inner = styled.div`
  width: 100%;
  position: relative;
  flex: 1;
  padding: ${subcategoryMargin}px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: white
`

const Subcategory = styled.div`
  position: relative;
`

const SubcategoryTitle = styled.div`
  line-height: 15px;
  text-align: center;

  a {
    color: #282828;
    font-size: 11;
  }
`

const Items = styled.div`
  overflow: hidden;
  margin: 0 auto;
  display: grid;
  ${props => props.fitWidth ?
     `justify-content: space-evenly` :
     `grid-gap: ${itemMargin}px`};
`

const VerticalCategory = ({header, subcategories, top, left, width, height, color, href, onSelectItem, fitWidth}) => {
  const subcategoriesWithCalculations = calculateVerticalCategory({ subcategories, fitWidth, width })
  return <div>
    <Wrapper className="big-picture-section" style={{ top, left, height, width, background: color }}>
      <Header>
        <InternalLink to={href}>{header}</InternalLink>
      </Header>
      <Inner>
        {subcategoriesWithCalculations.map(subcategory => {
          const { width, columns } = subcategory

          return <Subcategory key={subcategory.name}> 
            <SubcategoryTitle>
              <InternalLink to={subcategory.href}>
                {subcategory.name}
              </InternalLink>
            </SubcategoryTitle>

            <Items style={{ width, gridTemplateColumns: `repeat(${columns}, ${smallItemWidth}px)` }} fitWidth={fitWidth}>
              {subcategory.allItems.map(item => <Item item={item} onSelectItem={onSelectItem} key={item.name} fitWidth={fitWidth} />)}
            </Items>
          </Subcategory>
        })}
      </Inner>
    </Wrapper>
  </div>
}

export default VerticalCategory
