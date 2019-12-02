import React from 'react';
import { pure } from 'recompose';
import _ from 'lodash'
import InternalLink from '../InternalLink';
import Fade from '@material-ui/core/Fade';
import fields from '../../types/fields';
import settings from 'project/settings.yml'
import { getContrastRatio } from "@material-ui/core/styles";

const itemWidth = 36;
const itemHeight = 32;

const isLargeFn = function(x) {
  const relationInfo = _.find(fields.relation.values, {id: x.relation});
  if (x.category === settings.global.membership) {
    const membershipInfo = settings.membership[x.member];
    return membershipInfo && !!membershipInfo.is_large;
  }
  return !!relationInfo.big_picture_order;
}

const Item = (function({zoom, item, x, y, isLarge, onSelectItem}) {
  if (isLarge) {
    return <LargeItem {...{zoom, item, x, y, onSelectItem}} />;
  }
  const k = 1;
  const isMember = item.category === settings.global.membership;
  return <img style={{
      cursor: 'pointer',
      position: 'absolute',
      left: (itemWidth * x + 2) * zoom,
      top: (itemHeight * y + 2) * zoom,
      width: (itemWidth  * k - 2) * zoom,
      height: (itemHeight * k - 2) * zoom,
      border: isMember ? '' : `${1 * zoom}px solid grey`,
      borderRadius: 3 * zoom,
      padding: 1,
      background: isMember ? '' : item.oss ? '' : '#eee',
    }}
    data-href={item.id}
    loading="lazy"
    src={item.href}
    key={item.id}
    onClick={ () => onSelectItem(item.id)}
    alt={item.name}
  />
})

const LargeItem = (function({zoom, item, x, y, onSelectItem}) {
  const k = 2;
  const z = function(x) {
    return Math.round(x * zoom * 2) / 2;
  };
  const relationInfo = _.find(fields.relation.values, {id: item.relation});
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const isMember = item.category === settings.global.membership;

  return <div style={{
    cursor: 'pointer',
    position: 'absolute',
    background: isMember ? '' : item.oss ? '' : '#eee',
    border: `${z(2)}px solid ${color}`,
    left: (itemWidth * x + 3) * zoom,
    top: (itemHeight * y + 3) * zoom,
    width: (itemWidth  * k) * zoom,
    height: (itemHeight * k - 5) * zoom }}
    onClick={ () => onSelectItem(item.id)}
    key={item.id}
  >
    <img loading="lazy" src={item.href} style={{
      width: (itemWidth * k - 2 - 5) * zoom,
      height: (itemHeight * k - 9 - 2 - 10) * zoom,
      margin: z(2),
      padding: z(2)
    }} data-href={item.id} alt={item.name} />
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 10 * zoom, textAlign: 'center', background: color, color: 'white', fontSize: 6.7 * zoom, lineHeight: `${13 * zoom}px`}}>
    {label}
  </div>
  </div>;
})

const HorizontalSubcategory = (function({zoom, subcategory, rows, onSelectItem, parentHeight, xRatio }) {
  const categoryHeight = rows;
  const total = _.sumBy(subcategory.allItems, function(item) {
    return isLargeFn(item) ? 4 : 1;
  });
  const filteredItems = subcategory.items;
  let cols = Math.max(Math.ceil(total / categoryHeight ), 2);
  // what if we have 3 cols but first 2 items are large items, effectively
  // requiring 4 columns?
  if (cols % 2 === 1 && subcategory.allItems.slice(0, Math.trunc(cols / 2) + 1).every( (x) => isLargeFn(x))) {
    cols += 1;
  }
  const width = itemWidth * (cols - 1) * xRatio + itemWidth;
  const height = itemHeight * categoryHeight;
  const offset = (parentHeight - 20 - height) / 2;
  let x = 0;
  let y = 0;
  let busy = {};
  return <div style={{ width: width  * zoom, height: height * zoom, top: -40 * zoom, marginTop: (20 + offset) * zoom,  position: 'relative' }}>
    { subcategory.allItems.map(function(item) {
      const isVisible = !! _.find(filteredItems, function(x) { return x.id === item.id });
      const isLarge = isLargeFn(item);
      const result = {key: item.name, zoom: zoom, item, y: y, x: x, isLarge: isLarge, onSelectItem: onSelectItem};
      busy[`${x}:${y}`] = true;
      if (isLarge) {
        busy[`${x + 1}:${y}`] = true;
        busy[`${x}:${y+1}`] = true;
        busy[`${x + 1}:${y+1}`] = true;
      }
      while(busy[`${x}:${y}`]) {
        x += 1;
        if (x >= cols) {
          x = 0;
          y += 1;
        }
      }
      if (isVisible) {
        return <Item {...result} x={result.x * xRatio}/>;
      } else {
        return null;
      }
      return <Fade timeout={1000} in={isVisible}>
        <Item {...result} x={result.x * xRatio}/>
      </Fade>;
    }) }
  </div>
});

const VerticalSubcategory = (function({zoom, subcategory, cols, onSelectItem, xRatio}) {
  const categoryWidth = cols;
  const total = _.sumBy(subcategory.allItems, function(item) {
    return isLargeFn(item) ? 4 : 1;
  });
  const filteredItems = subcategory.items;
  const raws = Math.ceil(total / categoryWidth );
  const height = itemHeight * raws;
  const width  = itemWidth * categoryWidth;
  let x = 0;
  let y = 0;
  let busy = {};
  return <div style={{ left: 5 * zoom, width: width * zoom, height: height * zoom, position: 'relative' }} >
    { subcategory.allItems.map(function(item) {
      const isVisible = !! _.find(filteredItems, function(x) { return x.id === item.id });
      const isLarge = isLargeFn(item);
      const result = {key: item.name, zoom: zoom, item, y: y, x: x, isLarge: isLarge, onSelectItem: onSelectItem};
      busy[`${x}:${y}`] = true;
      if (isLarge) {
        busy[`${x + 1}:${y}`] = true;
        busy[`${x}:${y+1}`] = true;
        busy[`${x + 1}:${y+1}`] = true;
      }
      while(busy[`${x}:${y}`]) {
        x += 1;
        if (x >= categoryWidth) {
          x = 0;
          y += 1;
        }
      }

      if (isVisible) {
        return <Item {...result} x={result.x * xRatio}/>;
      } else {
        return null;
      }
      return <Fade timeout={1000} in={isVisible}>
        <Item {...result}  x={result.x * xRatio} />
      </Fade>;
    }) }
  </div>
});

const getSubcategoryWidth = function({subcategory, rows}) {
  const categoryHeight = rows;
  const total = _.sumBy(subcategory.allItems, function(item) {
    return isLargeFn(item) ? 4 : 1;
  });
  const cols = Math.max(Math.ceil(total / categoryHeight ), 2);
  const width = itemWidth * cols;
  return width;
}

const HorizontalCategory = (function({header, subcategories, rows, width, height, top, left, zoom, color, href, onSelectItem, fitWidth, offset = 50}) {

  let innerWidth = _.sumBy(subcategories, (subcategory) =>  getSubcategoryWidth({subcategory, rows}));
  const xRatio = fitWidth ? (width - offset ) / innerWidth : 1.05;

  return (
    <div style={{
      position: 'absolute', height: height * zoom, margin: 5 * zoom, width: width * zoom, top: (top - 5) * zoom, left: left * zoom
    }} className="big-picture-section" >
      <div
        style={{
          position: 'absolute',
          border: `${1 * zoom}px solid ${color}`,
          borderLeft: 0,
          background: 'white',
          top: 20 * zoom,
          bottom: 0,
          left: 0,
          right: 0,
          boxShadow: `0 ${4 * zoom}px ${8 * zoom}px 0 rgba(0, 0, 0, 0.2), 0 ${6 * zoom}px ${20 * zoom}px 0 rgba(0, 0, 0, 0.19)`
        }}
      >
        <div style={{
          top: '-1px',
          bottom: '-1px',
          left: '-1px',
          width: 31 * zoom,
          position: 'absolute',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          background: color,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <InternalLink to={href} style={{
            color: getContrastRatio('#ffffff', color) < 4.5 ? '#282828' : '#ffffff',
            fontSize: 12 * zoom,
            lineHeight: `${13 * zoom}px`
          }}>
            {header}
          </InternalLink>
        </div>
      </div>
      <div style={{position: 'absolute', left: 35 * zoom, top: 0, right: 10 * zoom, bottom: 0, display: 'flex', justifyContent: 'space-between'}}>
        {subcategories.map(function(subcategory, index, all) {
          return [
            <div key={subcategory.name} style={{position: 'relative', fontSize: `${10 * zoom}px`}}>
              <div style={{position: 'relative', width: '100%', height: 40 * zoom, top: -14 * zoom}}>
                  <span style={{textAlign: 'center', position: 'absolute', width: '100%', minWidth: 80 * zoom, transform: 'translate(-50%, -50%)', left: '50%', top:'50%'}}>
                    <InternalLink to={subcategory.href}>
                      <span style={{
                        color: 'white',
                        fontSize: 11 * zoom
                      }}>{subcategory.name}</span>
                    </InternalLink>
                  </span>
              </div>
              <HorizontalSubcategory subcategory={subcategory} rows={rows} zoom={zoom} onSelectItem={onSelectItem} parentHeight={height} xRatio={xRatio} key={subcategory.name}/>
            </div>,
            index !== all.length - 1 && <div key={index} style={{ top: 40 * zoom, height: `calc(100% - ${50 * zoom}px)`, border: `${Math.max(Math.round(zoom) / 2, 0.5)}px solid #777`, position: 'relative' }}></div>
          ]
        })}
      </div>
  </div>);
});


const VerticalCategory = (function({header, subcategories, cols = 6, top, left, width, height, color, zoom, href, onSelectItem}) {
  const xRatio = 1.07;
  return (<div style={{}}>
    <div style={{
      position: 'absolute', top: (top - 5) * zoom, left: left * zoom, height: height * zoom, margin: 5 * zoom, width: (width + 2) * zoom, background: 'white', border: `${1 * zoom}px solid ${color}`,
      boxShadow: `0 ${4 * zoom}px ${8 * zoom}px 0 rgba(0, 0, 0, 0.2), 0 ${6 * zoom}px ${20 * zoom}px 0 rgba(0, 0, 0, 0.19)`
    }} className="big-picture-section">
    <div style={{ width: width * zoom, height: 20 * zoom, lineHeight: `${20 * zoom}px`, textAlign: 'center', color: 'white', background: color, fontSize: 12 * zoom}}>
        <InternalLink to={href}>
          <span style={{
            color: 'white',
            fontSize: 12 * zoom
          }}>{header}</span>
        </InternalLink>
    </div>
    <div style={{ width: width * zoom, height: (height - 20) * zoom, top: 20 * zoom, left: 0, position: 'absolute', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 5, paddingBottom: 10}}>
      {subcategories.map(function(subcategory) {
        return <div key={subcategory.name} style={{position: 'relative'}}>
          <div style={{ fontSize: 10 * zoom, lineHeight: `${15 * zoom}px`, textAlign: 'center', color: color}}>
            <InternalLink to={subcategory.href}>
              <span style={{
                color: '#282828',
                fontSize: 11 * zoom
              }}>{subcategory.name}</span>
            </InternalLink>
          </div>
          <VerticalSubcategory subcategory={subcategory} zoom={zoom} cols={cols} onSelectItem={onSelectItem} xRatio={xRatio} />
        </div>
      })}
    </div>
    </div>
  </div>);
});

export {
  HorizontalCategory,
  VerticalCategory
};
