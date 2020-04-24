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

const Item = (function({item, x, y, isLarge, onSelectItem}) {
  if (isLarge) {
    return <LargeItem {...{item, x, y, onSelectItem}} />;
  }
  const k = 1;
  const isMember = item.category === settings.global.membership;
  return <img style={{
      cursor: 'pointer',
      position: 'absolute',
      left: itemWidth * x + 2,
      top: itemHeight * y + 2,
      width: itemWidth  * k - 2,
      height: itemHeight * k - 2,
      border: isMember ? '' : '1px solid grey',
      borderRadius: 3,
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

const LargeItem = (function({item, x, y, onSelectItem}) {
  const k = 2;
  const relationInfo = _.find(fields.relation.values, {id: item.relation});
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const isMember = item.category === settings.global.membership;

  return <div style={{
    cursor: 'pointer',
    position: 'absolute',
    background: isMember ? '' : item.oss ? '' : '#eee',
    border: `2px solid ${color}`,
    left: itemWidth * x + 3,
    top: itemHeight * y + 3,
    width: itemWidth  * k,
    height: itemHeight * k - 5 }}
    onClick={ () => onSelectItem(item.id)}
    key={item.id}
  >
    <img loading="lazy" src={item.href} style={{
      width: itemWidth * k - 7,
      height: itemHeight * k - 21,
      margin: 2,
      padding: 2
    }} data-href={item.id} alt={item.name} />
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, textAlign: 'center', background: color, color: 'white', fontSize: 6.7, lineHeight: '13px'}}>
    {label}
  </div>
  </div>;
})

const HorizontalSubcategory = (function({subcategory, rows, onSelectItem, parentHeight, xRatio }) {
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
  return <div style={{ width: width, height: height, top: -40, marginTop: 20 + offset,  position: 'relative' }}>
    { subcategory.allItems.map(function(item) {
      const isVisible = !! _.find(filteredItems, function(x) { return x.id === item.id });
      const isLarge = isLargeFn(item);
      const result = {key: item.name, item, y: y, x: x, isLarge: isLarge, onSelectItem: onSelectItem};
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

const VerticalSubcategory = (function({subcategory, cols, onSelectItem, xRatio}) {
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
  return <div style={{ left: 5, width: width, height: height, position: 'relative' }} >
    { subcategory.allItems.map(function(item) {
      const isVisible = !! _.find(filteredItems, function(x) { return x.id === item.id });
      const isLarge = isLargeFn(item);
      const result = {item, key: item.name, y: y, x: x, isLarge: isLarge, onSelectItem: onSelectItem};
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

const HorizontalCategory = (function({header, subcategories, rows, width, height, top, left, color, href, onSelectItem, fitWidth, offset = 50}) {

  let innerWidth = _.sumBy(subcategories, (subcategory) =>  getSubcategoryWidth({subcategory, rows}));
  const xRatio = fitWidth ? (width - offset ) / innerWidth : 1.05;

  return (
    <div style={{ position: 'absolute', height: height, margin: 5, width: width, top: top - 5, left: left }}
         className="big-picture-section" >
      <div
        style={{
          position: 'absolute',
          border: `1px solid ${color}`,
          borderLeft: 0,
          background: 'white',
          top: 20,
          bottom: 0,
          left: 0,
          right: 0,
          boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`
        }}
      >
        <div style={{
          top: '-1px',
          bottom: '-1px',
          left: '-1px',
          width: 31,
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
            fontSize: 12,
            lineHeight: '13px'
          }}>
            {header}
          </InternalLink>
        </div>
      </div>
      <div style={{position: 'absolute', left: 35, top: 0, right: 10, bottom: 0, display: 'flex', justifyContent: 'space-between'}}>
        {subcategories.map(function(subcategory, index, all) {
          return [
            <div key={subcategory.name} style={{position: 'relative', fontSize: 10}}>
              <div style={{position: 'relative', width: '100%', height: 40 , top: -14}}>
                  <span style={{textAlign: 'center', position: 'absolute', width: '100%', minWidth: 80, transform: 'translate(-50%, -50%)', left: '50%', top:'50%'}}>
                    <InternalLink to={subcategory.href}>
                      <span style={{color: 'white', fontSize: 11}}>
                        {subcategory.name}
                      </span>
                    </InternalLink>
                  </span>
              </div>
              <HorizontalSubcategory subcategory={subcategory} rows={rows} onSelectItem={onSelectItem} parentHeight={height} xRatio={xRatio} key={subcategory.name}/>
            </div>,
            index !== all.length - 1 && <div key={index} style={{ top: 40 , height: 'calc(100% - 50px)', border: '0.5px solid #777', position: 'relative' }}></div>
          ]
        })}
      </div>
  </div>);
});


const VerticalCategory = (function({header, subcategories, cols = 6, top, left, width, height, color, href, onSelectItem}) {
  const xRatio = 1.07;
  return (<div style={{}}>
    <div style={{
      position: 'absolute', top: top - 5, left: left, height: height, margin: 5, width: width + 2, background: 'white', border: `1px solid ${color}`,
      boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`
    }} className="big-picture-section">
    <div style={{ width: width, height: 20, lineHeight: '20px', textAlign: 'center', color: 'white', background: color, fontSize: 12}}>
        <InternalLink to={href}>
          <span style={{ color: 'white', fontSize: 12 }}>
            {header}
          </span>
        </InternalLink>
    </div>
    <div style={{ width: width, height: height - 20, top: 20, left: 0, position: 'absolute', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 5, paddingBottom: 10}}>
      {subcategories.map(function(subcategory) {
        return <div key={subcategory.name} style={{position: 'relative'}}>
          <div style={{ fontSize: 10, lineHeight: '15px', textAlign: 'center', color: color}}>
            <InternalLink to={subcategory.href}>
              <span style={{
                color: '#282828',
                fontSize: 11
              }}>{subcategory.name}</span>
            </InternalLink>
          </div>
          <VerticalSubcategory subcategory={subcategory} cols={cols} onSelectItem={onSelectItem} xRatio={xRatio} />
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
