import React, { useContext } from "react";
import Fade from "@material-ui/core/Fade";
import settings from '../../utils/settings.js'
import fields from "../../types/fields";
import {
  largeItemHeight,
  largeItemWidth,
  smallItemHeight,
  smallItemWidth
} from "../../utils/landscapeCalculations";
import EntriesContext from '../../contexts/EntriesContext'

const LargeItem = (({ item, onClick }) => {
  const relationInfo = fields.relation.values.find(({ id }) => id === item.relation);
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const textHeight = label ? 10 : 0
  const padding = 2

  return <div style={{
    cursor: 'pointer',
    position: 'relative',
    background: color,
    visibility: item.isVisible ? 'visible' : 'hidden',
    width: largeItemWidth,
    height: largeItemHeight }}
              onClick={onClick}
  >
    <img loading="lazy" src={`/${item.href}`} style={{
      width: `calc(100% - ${2 * padding}px)`,
      height: `calc(100% - ${2 * padding + textHeight}px)`,
      padding: 5,
      margin: `${padding}px ${padding}px 0 ${padding}px`,
    }} data-href={item.id} alt={item.name} />
    <div style={{position: 'absolute', bottom: 0, width: '100%', height: textHeight + padding, textAlign: 'center', verticalAlign: 'middle', background: color, color: 'white', fontSize: 6.7, lineHeight: '13px'}}>
      {label}
    </div>
  </div>;
})

const SmallItem = (({ item, onClick }) => {
  const isMember = item.category === settings.global.membership;
  return <img style={{
    cursor: 'pointer',
    width: smallItemWidth,
    height: smallItemHeight,
    border: `1px solid ${isMember ? 'white' : 'grey'}`,
    borderRadius: 2,
    padding: 1,
    visibility: item.isVisible ? 'visible' : 'hidden'
  }}
              data-href={item.id}
              loading="lazy"
              src={`/${item.href}`}
              onClick={onClick}
              alt={item.name}
  />

})

export default props => {
  const { isLarge, isVisible, category, oss, categoryAttrs } = props.item
  const isMember = category === settings.global.membership;
  const { navigate } = useContext(EntriesContext)
  const onClick = _ => navigate({ selectedItemId: props.item.id })
  const newProps = { ...props, onClick }

  const style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gridColumnEnd: `span ${isLarge ? 2 : 1}`,
    gridRowEnd: `span ${isLarge ? 2 : 1}`
  }

  return <Fade timeout={1000} in={isVisible}>
    <div className={isMember || oss || categoryAttrs.isLarge ? 'oss' : 'nonoss'} style={style}>
      {isLarge ? <LargeItem {...newProps} isMember={isMember} /> : <SmallItem {...newProps} />}
    </div>
  </Fade>
}
