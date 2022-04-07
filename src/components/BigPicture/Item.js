import settings from 'public/settings.json'
import fields from "../../types/fields";
import {
  largeItemHeight,
  largeItemWidth,
  smallItemHeight,
  smallItemWidth
} from "../../utils/landscapeCalculations";
import assetPath from '../../utils/assetPath'

const LargeItem = ({ item, onClick }) => {
  const relationInfo = fields.relation.valuesMap[item.relation]
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const textHeight = label ? 10 : 0
  const padding = 2

  return <div className="large-item item" onClick={onClick} style={{
        cursor: 'pointer',
        position: 'relative',
        background: color,
        visibility: item.isVisible ? 'visible' : 'hidden',
        width: largeItemWidth,
        height: largeItemHeight
    }}>

  <img loading="lazy" src={assetPath(item.href)} data-href={item.id} alt={item.name} style={{
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
    <img data-href={item.id} loading="lazy" className="item" src={assetPath(item.href)} onClick={onClick} alt={item.name} style={{
        cursor: 'pointer',
        width: smallItemWidth,
        height: smallItemHeight,
        border: `1px solid ${isMember ? 'white' : 'grey'}`,
        borderRadius: 2,
        padding: 1,
        visibility: item.isVisible ? 'visible' : 'hidden'
    }}/>
  </>
}

const Item = props => {
  const { isLarge, category, oss, categoryAttrs } = props.item
  const isMember = category === settings.global.membership;

  return <div className={isMember || oss || categoryAttrs.isLarge ? 'oss' : 'nonoss'} style={{
    display: 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'gridColumnEnd': `span ${isLarge ? 2 : 1}`,
    'gridRowEnd': `span ${isLarge ? 2 : 1}`
    }}>
    {isLarge ? <LargeItem {...props} isMember={isMember} /> : <SmallItem {...props} />}
  </div>
}

export default Item
