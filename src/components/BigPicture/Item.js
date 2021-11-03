import { useContext } from 'react'
import settings from 'public/settings.json'
import fields from "../../types/fields";
import {
  largeItemHeight,
  largeItemWidth,
  smallItemHeight,
  smallItemWidth
} from "../../utils/landscapeCalculations";
import LandscapeContext from '../../contexts/LandscapeContext'
import assetPath from '../../utils/assetPath'
import {
  withStyles
} from "@material-ui/core/styles"
import Tooltip from "@material-ui/core/Tooltip"
import useSWR from 'swr'

const BlueOnGreenTooltip = withStyles({
  tooltip: {
    color: "white",
    backgroundColor: "#1b446c"
  }
})(Tooltip);

const fetchItem = itemId => useSWR(itemId ? assetPath(`/data/items/${itemId}.json`) : null)

const LargeItem = ({ item, onClick }) => {
  const { entries } = useContext(LandscapeContext)
  const relationInfo = fields.relation.valuesMap[item.relation]
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const name = item.name;
  const textHeight = label ? 10 : 0
  const padding = 2
  const selectedItemId = item.id
  const { data: selectedItem } = fetchItem(selectedItemId)
  const itemInfo = selectedItem || entries.find(({ id }) => id === selectedItemId)
  return <div className="large-item item" onClick={onClick}>
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

    { itemInfo.tag === 'verification' ?
        <BlueOnGreenTooltip title={name} placement="top">
          <img loading="lazy" src={assetPath(item.href)} data-href={item.id} alt={item.name} />
        </BlueOnGreenTooltip>
      :
      <img loading="lazy" src={assetPath(item.href)} data-href={item.id} alt={item.name} />
    }

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
    <img data-href={item.id} loading="lazy" className="item" src={assetPath(item.href)} onClick={onClick} alt={item.name} />
  </>
}

const Item = props => {
  const { isLarge, category, oss, categoryAttrs } = props.item
  const isMember = category === settings.global.membership;
  const { navigate } = useContext(LandscapeContext)
  const onClick = _ => navigate({ selectedItemId: props.item.id }, { scroll: false })
  const newProps = { ...props, onClick }

  return <div className={isMember || oss || categoryAttrs.isLarge ? 'oss' : 'nonoss'}>
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
}

export default Item
