import React from 'react';
import { pure } from 'recompose';
import _ from 'lodash';

import {HorizontalCategory, VerticalCategory } from './Elements';
import LandscapeInfo from './LandscapeInfo';
import OtherLandscapeLink from './OtherLandscapeLink';

const LandscapeContent = ({groupedItems, onSelectItem, style, zoom, switchToLandscape, landscapeSettings }) => {
  const elements = landscapeSettings.elements.map(function(element) {
    if (element.type === 'HorizontalCategory') {
      const cat = _.find(groupedItems, {key: element.category});
      return <HorizontalCategory {...cat} {..._.pick(element, ['rows','width','height','top','left','color', 'offset']) }
        fitWidth={element.fit_width}
        onSelectItem={onSelectItem}
      />
    }
    if (element.type === 'VerticalCategory') {
      const cat = _.find(groupedItems, {key: element.category});
      return <VerticalCategory {...cat} {..._.pick(element, ['cols','width','height','top','left','color']) }
        onSelectItem={onSelectItem}
      />
    }
    if (element.type === 'LandscapeLink') {
      return <OtherLandscapeLink {..._.pick(element, ['width','height','top','left','color', 'layout', 'title', 'url']) }
        onClick={() => switchToLandscape(element.url)}
        key={element.url}
      />
    }
    if (element.type === 'LandscapeInfo') {
      return <LandscapeInfo {..._.pick(element, ['width', 'height', 'top', 'left']) } childrenInfo={element.children}
        key='landscape-info'
      />
    }
    return null;
  });
  const newStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: '0 0',
    position: 'relative'
  }
  return <div style={{...style, ...landscapeSettings.size, ...newStyle }}>{elements}</div>
};

export default pure(LandscapeContent);
