import { useContext } from 'react'
import Fade from "@material-ui/core/Fade";
import settings from 'project/settings.yml';
import fields from "../../types/fields";
import {
  largeItemHeight,
  largeItemWidth,
  smallItemHeight,
  smallItemWidth
} from "../../utils/landscapeCalculations";
import EntriesContext from '../../contexts/EntriesContext'
import assetPath from '../../utils/assetPath'

const LargeItem = ({ item, onClick }) => {
  const relationInfo = fields.relation.values.find(({ id }) => id === item.relation);
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const textHeight = label ? 10 : 0
  const padding = 2

  return <div className="large-item" onClick={onClick}>
    <style jsx>{`
      .large-item {
        cursor: pointer;
        position: relative;
        background: ${color};
        visibility: ${item.isVisible ? 'visible' : 'hidden'};
        width: ${largeItemWidth}px;
        height: ${largeItemHeight}px;
      }

      .large-item img {
        width: calc(100% - ${2 * padding}px);
        height: calc(100% - ${2 * padding + textHeight}px);
        padding: 5px;
        margin: ${padding}px ${padding}px 0 ${padding}px;
      }

      .large-item .label {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: ${textHeight + padding}px;
        text-align: center;
        vertical-align: middle;
        background: ${color};
        color: white;
        font-size: 6.7px;
        line-height: 13px;
      }
    `}</style>

    <img loading="lazy" src={assetPath(item.href)} data-href={item.id} alt={item.name} />
    <div className="label">{label}</div>
  </div>;
}

const SmallItem = ({ item, onClick }) => {
  const isMember = item.category === settings.global.membership;
  return <>
    <style jsx>{`
      img {
        cursor: pointer;
        width: ${smallItemWidth}px;
        height: ${smallItemHeight}px;
        border: 1px solid ${isMember ? 'white' : 'grey'};
        border-radius: 2px;
        padding: 1px;
        visibility: ${item.isVisible ? 'visible' : 'hidden'};
      }
    `}</style>
    <img data-href={item.id} loading="lazy" src={assetPath(item.href)} onClick={onClick} alt={item.name} />
  </>
}

const Item = props => {
  const { isLarge, isVisible, category, oss, categoryAttrs } = props.item
  const isMember = category === settings.global.membership;
  const { navigate } = useContext(EntriesContext)
  const onClick = _ => navigate({ selectedItemId: props.item.id })
  const newProps = { ...props, onClick }

  return <Fade timeout={1000} in={isVisible}>
    <div className={isMember || oss || categoryAttrs.isLarge ? 'oss' : 'nonoss'}>
      <style jsx>{`
        div {
          display: flex;
          justify-content: center;
          align-items: center;
          grid-column-end: span ${isLarge ? 2 : 1};
          grid-row-end: span ${isLarge ? 2 : 1};
        }
      `}</style>

      {isLarge ? <LargeItem {...newProps} isMember={isMember} /> : <SmallItem {...newProps} />}
    </div>
  </Fade>
}

export default Item
