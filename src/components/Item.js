import path from 'path';
import fs from 'fs';
import settings from 'dist/settings';
import fields from "../types/fields";
import {
  largeItemHeight,
  largeItemWidth,
  smallItemHeight,
  smallItemWidth
} from "../utils/landscapeCalculations";
import assetPath from '../utils/assetPath'

const LargeItem = ({ item, onClick }) => {
  const relationInfo = fields.relation.valuesMap[item.relation]
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const textHeight = label ? 10 : 0
  const padding = 2

  return <div data-id={item.id} className="large-item item" onClick={onClick} style={{ background: color }}>

  <img loading="lazy" src={assetPath(item.href)} alt={item.name} style={{
        width: `calc(100% - ${2 * padding}px)`,
        height: `calc(100% - ${2 * padding + textHeight}px)`,
        padding: 5,
        margin: `${padding}px ${padding}px 0 ${padding}px`
  }}/>
  <div className="label" style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: `${textHeight + padding}px`,
        textAlign: 'center',
        verticalAlign: 'middle',
        background: color,
        color: 'white',
        fontSize: '6.7px',
        lineHeight: '13px'
  }}>{label}</div>
  </div>;
}

const SmallItem = ({ item, onClick }) => {
  const isMember = item.category === settings.global.membership;
  return <>
    <img data-id={item.id} loading="lazy" className="item small-item" src={assetPath(item.href)} onClick={onClick} alt={item.name} style={{
        borderColor: isMember ? 'white' : undefined
    }}/>
  </>
}

const Item = props => {
  const { isLarge, category, oss, categoryAttrs } = props.item
  const isMember = category === settings.global.membership;

  const ossClass = isMember || oss || categoryAttrs.isLarge ? 'oss' : 'nonoss';
  const isLargeClass = isLarge ? 'wrapper-large' : '';

  return <div className={isLargeClass + ' item-wrapper ' + ossClass}>
    {isLarge ? <LargeItem {...props} isMember={isMember} /> : <SmallItem {...props} />}
  </div>
}

export default Item
