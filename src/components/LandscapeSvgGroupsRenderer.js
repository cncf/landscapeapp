const _ = require('lodash');

// Render all items here!

const { renderHorizontalCategory  } = require('./HorizontalCategory');
const { renderVerticalCategory } = require('./VerticalCategory');

const extractKeys = (obj, keys) => {
  const attributes = _.pick(obj, keys)

  return _.mapKeys(attributes, (value, key) => _.camelCase(key))
}


// this one should return a hash instead of a string
module.exports.render = function({landscapeSettings, landscapeItems}) {
  const result = {};

  let index = 0;
  for(let element of landscapeSettings.elements) {
    const category = landscapeItems.find(c => c.key === element.category) || {}
    const attributes = extractKeys(element, ['width', 'height', 'top', 'left', 'color', 'fit_width', 'is_large'])

    if (element.type === 'HorizontalCategory' || element.type === 'VerticalCategory') {
      const subcategories = category.subcategories.map(subcategory => {
        const allItems = subcategory.allItems.map(item => ({ ...item, categoryAttrs: attributes }))
        return { ...subcategory, allItems }
      })

      if (element.type === 'HorizontalCategory') {
        const html = renderHorizontalCategory({...category, index, ...attributes, renderIcons: true, subcategories: subcategories});
        result[index] = html;
      }

      if (element.type === 'VerticalCategory') {
        const html = renderVerticalCategory({...category, index, ...attributes, renderIcons: true, subcategories: subcategories});
        result[index] = html;
      }
    }
    index += 1;
  }
  return result;
};
