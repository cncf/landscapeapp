import React, { useContext } from 'react';
import { pure } from 'recompose';
import _ from 'lodash';
import HorizontalCategory from './HorizontalCategory'
import VerticalCategory from './VerticalCategory'
import LandscapeInfo from './LandscapeInfo';
import OtherLandscapeLink from './OtherLandscapeLink';
import LandscapeContext from '../../contexts/LandscapeContext'

const extractKeys = (obj, keys) => {
  const attributes = _.pick(obj, keys)

  return _.mapKeys(attributes, (value, key) => _.camelCase(key))
}

const LandscapeContent = ({zoom, padding = 10 }) => {
  const { groupedItems, landscapeSettings, width, height } = useContext(LandscapeContext)
  const elements = landscapeSettings.elements.map(element => {
    if (element.type === 'LandscapeLink') {
      return <OtherLandscapeLink {..._.pick(element, ['width','height','top','left','color', 'layout', 'title', 'url', 'image']) }
                                 key={element.url}
      />
    }
    if (element.type === 'LandscapeInfo') {
      return <LandscapeInfo {..._.pick(element, ['width', 'height', 'top', 'left']) } childrenInfo={element.children}
                            key={element.key ? element.key : 'landscape-info'}
      />
    }

    const category = groupedItems.find(c => c.key === element.category) || {}
    const attributes = extractKeys(element, ['width', 'height', 'top', 'left', 'color', 'fit_width', 'is_large'])
    const subcategories = category.subcategories.map(subcategory => {
      const allItems = subcategory.allItems.map(item => ({ ...item, categoryAttrs: attributes }))
      return { ...subcategory, allItems }
    })

    const Component = element.type === 'HorizontalCategory' ? HorizontalCategory : VerticalCategory
    return <Component {...category} subcategories={subcategories} {...attributes} />
  });

  const style = {
    padding,
    width: width + 2 * padding,
    height: height + 2 * padding,
    transform: `scale(${zoom})`,
    transformOrigin: '0 0'
  }

  return <div className="inner-landscape" style={style}>
    <div style={{ position: 'relative' }}>
      {elements}
    </div>
  </div>
};

export default pure(LandscapeContent);
