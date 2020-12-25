import React, { useContext } from 'react';
import { pure } from 'recompose';
import _ from 'lodash';
import HorizontalCategory from './HorizontalCategory'
import VerticalCategory from './VerticalCategory'
import LandscapeInfo from './LandscapeInfo';
import OtherLandscapeLink from './OtherLandscapeLink';
import { calculateSize } from "../../utils/landscapeCalculations";
import EntriesContext from '../../contexts/EntriesContext'

const extractKeys = (obj, keys) => {
  const attributes = _.pick(obj, keys)

  return _.mapKeys(attributes, (value, key) => _.camelCase(key))
}

const LandscapeContent = ({groupedItems, onSelectItem, zoom, landscapeSettings, padding = 10 }) => {
  const { navigate } = useContext(EntriesContext)
  const switchToLandscape = mainContentMode => navigate({ mainContentMode })
  const elements = landscapeSettings.elements.map(element => {
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

    const category = groupedItems.find(c => c.key === element.category) || {}
    const attributes = extractKeys(element, ['width', 'height', 'top', 'left', 'color', 'fit_width', 'is_large'])
    const subcategories = category.subcategories.map(subcategory => {
      const allItems = subcategory.allItems.map(item => ({ ...item, categoryAttrs: attributes }))
      return { ...subcategory, allItems }
    })

    const Component = element.type === 'HorizontalCategory' ? HorizontalCategory : VerticalCategory
    return <Component {...category} subcategories={subcategories} {...attributes} onSelectItem={onSelectItem}/>
  });

  const { width, height } = calculateSize(landscapeSettings)

  const style = {
    padding,
    width: width + 2 * padding,
    height: height + 2 * padding,
    transform: `scale(${zoom})`,
    transformOrigin: '0 0'
  }

  return <div style={style}>
    <div style={{ position: 'relative' }}>
      {elements}
    </div>
  </div>
};

export default pure(LandscapeContent);
