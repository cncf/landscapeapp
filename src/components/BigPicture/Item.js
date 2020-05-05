import React from "react";
import Fade from "@material-ui/core/Fade";
import settings from 'project/settings.yml'
import fields from "../../types/fields";
import {
  itemMargin,
  largeItemHeight,
  largeItemWidth,
  smallItemHeight,
  smallItemWidth
} from "../../utils/landscapeCalculations";

const ItemWrapper = ({ isLarge, fitWidth, children }) => {
  if (!fitWidth) {
    return children
  }
  const style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gridColumnEnd: `span ${isLarge ? 2 : 1}`,
    gridRowEnd: `span ${isLarge ? 2 : 1}`
  }

  return <div style={style}>{children}</div>
}

const LargeItem = (({item, onSelectItem, fitWidth}) =>  {
  const relationInfo = fields.relation.values.find(({ id }) => id === item.relation);
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const isMember = item.category === settings.global.membership;
  const textHeight = isMember ? 0 : 10

  return <div style={{
    cursor: 'pointer',
    position: 'relative',
    margin: fitWidth ? 0 : `0 ${itemMargin}px ${itemMargin}px 0`,
    background: isMember || item.oss ? '' : '#eee',
    border: `2px solid ${color}`,
    float: 'left',
    visibility: item.isVisible ? 'visible' : 'hidden',
    width: largeItemWidth,
    height: largeItemHeight }}
              onClick={ () => onSelectItem(item.id)}
  >
    <img loading="lazy" src={item.href} style={{
      width: 'calc(100% - 10px)',
      height: `calc(100% - ${10 + textHeight}px)`,
      margin: 5,
    }} data-href={item.id} alt={item.name} />
    <div style={{position: 'absolute', bottom: 0, width: '100%', height: textHeight, textAlign: 'center', background: color, color: 'white', fontSize: 6.7, lineHeight: '13px'}}>
      {label}
    </div>
  </div>;
})

const SmallItem = (({item, onSelectItem, fitWidth}) => {
  const isMember = item.category === settings.global.membership;
  return <img style={{
    cursor: 'pointer',
    float: 'left',
    width: smallItemWidth,
    height: smallItemHeight,
    border: `1px solid ${isMember ? 'white' : 'grey'}`,
    borderRadius: 2,
    margin: fitWidth ? 0 : `0 ${itemMargin}px ${itemMargin}px 0`,
    padding: 1,
    background: isMember || item.oss ? '' : '#eee',
    visibility: item.isVisible ? 'visible' : 'hidden'
  }}
              data-href={item.id}
              loading="lazy"
              src={item.href}
              onClick={() => onSelectItem(item.id)}
              alt={item.name}
  />

})

export default props => {
  const { item, fitWidth } = props
  const itemComponent = item.isLarge ? <LargeItem {...props} /> : <SmallItem {...props} />

  return <Fade timeout={1000} in={item.isVisible}>
    <ItemWrapper fitWidth={fitWidth} isLarge={item.isLarge}>
      {itemComponent}
    </ItemWrapper>
  </Fade>
}
