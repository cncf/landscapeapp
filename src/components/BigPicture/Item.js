import React from "react";
import styled from 'styled-components'
import Fade from "@material-ui/core/Fade";
import settings from 'project/settings.yml'
import fields from "../../types/fields";
import {
  largeItemHeight,
  largeItemWidth,
  smallItemHeight,
  smallItemWidth
} from "../../utils/landscapeCalculations";

const LargeWrapper = styled.div`
  cursor: pointer;
  position: relative;
  width: ${largeItemWidth}px;
  height: ${largeItemHeight}px;
`

const LargeImage = styled.img`
  width: ${props => `calc(100% - ${2 * props.padding}px)`};
  height: ${props => `calc(100% - ${2 * props.padding + props.textHeight}px)`};
  padding: 5;
  margin: ${props => `${props.padding}px ${props.padding}px 0 ${props.padding}px`};
`

const LargeItemLabel = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: ${props => props.textHeight + props.padding}px;
  text-align: center;
  vertical-align: middle;
  color: white;
  font-size: 6.7px;
  line-height: 13px;
`

const LargeItem = (({ item, onSelectItem, isMember }) => {
  const relationInfo = fields.relation.values.find(({ id }) => id === item.relation);
  const background = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const textHeight = isMember ? 0 : 10
  const padding = 2

  return <LargeWrapper style={{ background }} onClick={() => onSelectItem(item.id)}>
    <LargeImage loading="lazy" src={item.href} data-href={item.id} alt={item.name} padding={padding} textHeight={textHeight} />
    <LargeItemLabel textHeight={textHeight} padding={padding}>{label}</LargeItemLabel>
  </LargeWrapper>;
})

const SmallImage = styled.img`
  cursor: pointer;
  width: ${smallItemWidth}px;
  height: ${smallItemHeight}px;
  border: 1px solid ${props => props.isMember ? 'white' : 'grey'};
  border-radius: 2px;
  padding: 1px;
`

const SmallItem = (({ item, onSelectItem }) => {
  const { id, href, name, category } = item
  const isMember = category === settings.global.membership;
  return <SmallImage data-href={id} loading="lazy" src={href} onClick={() => onSelectItem(id)} alt={name} isMember={isMember} />
})

const ItemWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  grid-column-end: span ${props => props.isLarge ? 2 : 1};
  grid-row-end: span ${props => props.isLarge ? 2 : 1};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
`

export default props => {
  const { isLarge, isVisible, category, oss } = props.item
  const isMember = category === settings.global.membership;

  return <Fade timeout={1000} in={isVisible}>
    <ItemWrapper className={isMember || oss ? 'oss' : 'nonoss'} isLarge={isLarge} isVisible={isVisible}>
      {isLarge ? <LargeItem {...props} isMember={isMember} /> : <SmallItem {...props} />}
    </ItemWrapper>
  </Fade>
}
