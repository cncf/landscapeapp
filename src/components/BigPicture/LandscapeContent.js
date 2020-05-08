import React from 'react';
import { pure } from 'recompose';
import _ from 'lodash';
import HorizontalCategory from './HorizontalCategory'
import VerticalCategory from './VerticalCategory'
import LandscapeInfo from './LandscapeInfo';
import OtherLandscapeLink from './OtherLandscapeLink';
import { calculateSize } from "../../utils/landscapeCalculations";

const extractKeys = (obj, keys) => {
  const attributes = _.pick(obj, keys)

  return _.mapKeys(attributes, (value, key) => _.camelCase(key))
}

const LandscapeContent = ({groupedItems, onSelectItem, style, zoom, switchToLandscape, landscapeSettings }) => {
  const elements = landscapeSettings.elements.map(function(element) {
    if (element.type === 'HorizontalCategory') {
      const cat = _.find(groupedItems, {key: element.category});
      const attributes = extractKeys(element, ['width', 'height', 'top', 'left', 'color', 'fit_width'])
      return <HorizontalCategory {...cat} {...attributes} onSelectItem={onSelectItem}/>
    }
    if (element.type === 'VerticalCategory') {
      const cat = _.find(groupedItems, {key: element.category});
      const attributes = extractKeys(element, ['width', 'height', 'top', 'left', 'color', 'fit_width'])
      return <VerticalCategory {...cat} {...attributes} onSelectItem={onSelectItem}/>
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

  const horizontalMargin = 5
  const margin = `0 ${horizontalMargin}px`
  const { width, height } = calculateSize(landscapeSettings)

  return <div style={{margin, width: width + horizontalMargin * 2, height: height + 10 }}>
    <div style={{...style, width, height, transform: `scale(${zoom})`, transformOrigin: '0 0', position: 'relative' }}>
      {elements}
    </div>
  </div>
};

export default pure(LandscapeContent);
