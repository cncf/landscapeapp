import React, { Fragment } from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';

// Render all items here!

import HorizontalCategory from './HorizontalCategory'
import VerticalCategory from './VerticalCategory'
import LandscapeInfo from './LandscapeInfo';
import OtherLandscapeLink from './OtherLandscapeLink';

const extractKeys = (obj, keys) => {
  const attributes = _.pick(obj, keys)

  return _.mapKeys(attributes, (value, key) => _.camelCase(key))
}


export function getElement({landscapeSettings, landscapeItems}) {
  const elements = landscapeSettings.elements.map(element => {
    if (element.type === 'LandscapeLink') {
      return <OtherLandscapeLink {..._.pick(element, ['width','height','top','left','color', 'layout', 'title', 'url', 'image']) }
                                 key={JSON.stringify(element)}
      />
    }
    if (element.type === 'LandscapeInfo') {
      return <LandscapeInfo {..._.pick(element, ['width', 'height', 'top', 'left']) } childrenInfo={element.children}
                            key={JSON.stringify(element)}
      />
    }

    const category = landscapeItems.find(c => c.key === element.category) || {}
    const attributes = extractKeys(element, ['width', 'height', 'top', 'left', 'color', 'fit_width', 'is_large'])
    const subcategories = category.subcategories.map(subcategory => {
      const allItems = subcategory.allItems.map(item => ({ ...item, categoryAttrs: attributes }))
      return { ...subcategory, allItems }
    })

    const Component = element.type === 'HorizontalCategory' ? HorizontalCategory : VerticalCategory
    return <Component {...category} subcategories={subcategories} {...attributes} />
  });

  return <div style={{ position: 'relative' }}>
      {elements}
    </div>
};
export function render() {
  return ReactDOMServer.renderToStaticMarkup(getElement.apply(this, arguments));
}
