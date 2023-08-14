const _ = require('lodash');

// Render all items here!

const { renderHorizontalCategory } = require('./HorizontalCategory');
const { renderVerticalCategory } = require('./VerticalCategory');
const { renderLandscapeInfo } = require('./LandscapeInfo');
const { renderOtherLandscapeLink } = require('./OtherLandscapeLink');

const extractKeys = (obj, keys) => {
  const attributes = _.pick(obj, keys)

  return _.mapKeys(attributes, (value, key) => _.camelCase(key))
}


module.exports.render = function({landscapeSettings, landscapeItems}) {
  const elements = landscapeSettings.elements.map(element => {
    if (element.type === 'LandscapeLink') {
      return renderOtherLandscapeLink(element)
    }
    if (element.type === 'LandscapeInfo') {
      return renderLandscapeInfo(element)
    }
    const category = landscapeItems.find(c => c.key === element.category);
    if (!category) {
      console.info(`Can not find the ${element.category}`);
      console.info(`Valid values: ${landscapeItems.map( (x) => x.key).join('; ')}`);
    }
    const attributes = extractKeys(element, ['width', 'height', 'top', 'left', 'color', 'fit_width', 'is_large'])
    const subcategories = category.subcategories.map(subcategory => {
      const allItems = subcategory.allItems.map(item => ({ ...item, categoryAttrs: attributes }))
      return { ...subcategory, allItems }
    })

    if (element.type === 'HorizontalCategory') {
      return renderHorizontalCategory({...category, ...attributes, subcategories: subcategories});
    }
    if (element.type === 'VerticalCategory') {
      return renderVerticalCategory({...category, ...attributes, subcategories: subcategories});
    }
  }).join('');

  return `<div style="position: relative;">${elements}</div>`;
};
