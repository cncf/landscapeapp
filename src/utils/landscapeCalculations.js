const { readJsonFromDist } = require('./readJson');
const { fields } = require("../types/fields");

const settings = readJsonFromDist('settings');

/* eslint-disable no-unused-vars */
const itemMargin = module.exports.itemMargin = 3;
const smallItemWidth = module.exports.smallItemWidth = 34;
const smallItemHeight = module.exports.smallItemHeight = 30;
const subcategoryMargin = module.exports.subcategoryMargin = 6;
const subcategoryTitleHeight = module.exports.subcategoryTitleHeight = 20;
const dividerWidth = module.exports.dividerWidth = 2;
const categoryBorder = module.exports.categoryBorder = 1;
const categoryTitleHeight = module.exports.categoryTitleHeight = 30;
const outerPadding = module.exports.outerPadding = 20;
const headerHeight = module.exports.headerHeight = 40;
/* eslint-enable */

// Check if item is large
const sizeFn = module.exports.sizeFn = ({ relation, category, member, categoryAttrs }) => {
  const relationInfo = fields.relation.valuesMap[relation]
  if (!relationInfo) {
    console.error(`No relation with name ${relation}`);
  }
  if (relationInfo.x4) {
    return 16;
  }
  if (category === settings.global.membership) {
    const membershipInfo = settings.membership[member];
    return (membershipInfo && !!membershipInfo.is_large) ? 4 : 1;
  }
  return (!!categoryAttrs.isLarge || !!relationInfo.big_picture_order) ? 4 : 1;
}

// Compute if items are large and/or visible.
// Count number of items, large items count for 4 small items.
// Count number of large items.
const computeItems = (subcategories, addInfoIcon = false) => {
  return subcategories.map(subcategory => {
    const filteredItems = subcategory.items.reduce((acc, { id }) => ({ ...acc, [id]: true }), {})
    const allItems = subcategory.allItems.map(item => ({ ...item, size: sizeFn(item), isVisible: filteredItems[item.id]  }))
    const itemsCount = allItems.reduce((count, item) => count + item.size, 0) + (addInfoIcon ? 1 : 0)
    const largeItemsCount = allItems.reduce((count, item) => count + (item.size === 16 ? 4 : item.size === 4 ? 1 : 0), 0)
    return { ...subcategory, allItems, itemsCount, largeItemsCount }
  })
}

// Calculate width and height of a given landscape
module.exports.calculateSize = landscapeSettings => {
  const width = Math.max(...landscapeSettings.elements.map(({ left, width }) => left + width))
  const height = Math.max(...landscapeSettings.elements.map(({ top, height }) => top + height))
  const fullscreenWidth = width + 2 * outerPadding
  const fullscreenHeight = height + headerHeight + 2 * outerPadding

  return { width, height, fullscreenWidth, fullscreenHeight }
}

// Calculate each subcategory width and the disposition of its items, assuming fixed padding for each item.
const calculateHorizontalFixedWidth = ({ subcategories, maxColumns, maxRows  }) => {
  let availableColumns = maxColumns

  subcategories.slice(0)
    .sort((a, b) => b.itemsCount - a.itemsCount) // Probably this sorting is unnecessary
    .forEach(subcategory => {
      subcategory.columns = Math.ceil(subcategory.itemsCount / maxRows)
      if (subcategory.columns % 2 === 1 && subcategory.columns < subcategory.largeItemsCount * 2) {
        subcategory.columns += 1
      }
      availableColumns -= subcategory.columns
      subcategory.rows = Math.ceil(subcategory.itemsCount / subcategory.columns)
    })

  // Assign any available columns left to subcategories.
  // Try to assign first to those subcategories that have more rows,
  // in case two subcategories have the same number of rows assign it to the one with less columns
  subcategories.slice(0)
    .sort((a, b) => a.columns - b.columns)
    .sort((a, b) => b.rows - a.rows)
    .forEach((subcategory, idx, collection) => {
      const nextSubcategory = collection[idx + 1]
      const nextRows = (nextSubcategory && nextSubcategory.rows) || 0
      const { largeItemsCount } = subcategory
      while ((availableColumns > 1 || (availableColumns > 0 && subcategory.columns >= largeItemsCount * 2)) && subcategory.rows >= nextRows) {
        const additionalColumns = subcategory.columns < largeItemsCount * 2 ? 2 : 1
        subcategory.columns += additionalColumns
        subcategory.rows =  Math.ceil(subcategory.itemsCount / subcategory.columns)
        availableColumns -= additionalColumns
      }
      subcategory.width = subcategory.columns * (itemMargin + smallItemWidth) - itemMargin
    })

  return subcategories
}

// Calculate each subcategory width and the disposition of its items,
// evenly distributing items across the available space
const calculateHorizontalStretch = ({ subcategories, maxWidth, maxHeight }) => {
  const totalItems = subcategories.reduce((acc, { itemsCount }) => acc + itemsCount, 0)
  let totalColumns = 0

  subcategories.forEach(subcategory => {
    const { itemsCount, largeItemsCount } = subcategory
    // Each subcategory gets width proportional to it's number of items
    const subcategoryMaxWidth = Math.floor(maxWidth * itemsCount / totalItems)
    let difference = Math.max(subcategoryMaxWidth, maxHeight)

    // The goal is to find a combination of rows and columns that minimizes |verticalSpace - horizontalSpace|
    // where verticalSpace and horizontalSpace are approximately vertical padding and horizontal padding, respectively.
    for (let rows = 1; rows <= Math.floor(maxHeight / smallItemHeight); rows++) {
      let columns = Math.ceil(itemsCount / rows)

      // Check we special case around large items and an odd number of columns
      if (columns % 2 === 1 && largeItemsCount * 2 > columns) {
        columns += 1
      }

      // Skip we special case around large items and an odd number of rows
      if (rows % 2 === 1 && Math.ceil(largeItemsCount * 4 / columns) >= rows) {
        continue
      }

      const verticalSpace = (maxHeight - rows * smallItemHeight) / rows
      const horizontalSpace = (subcategoryMaxWidth - columns * smallItemWidth) / columns

      if (Math.abs(verticalSpace - horizontalSpace) < difference) {
        difference = Math.abs(verticalSpace - horizontalSpace)
        subcategory.rows = rows
        subcategory.columns = columns
      }
    }

    totalColumns += subcategory.columns
  })

  subcategories.forEach(subcategory => subcategory.width = Math.floor(maxWidth * subcategory.columns / totalColumns))

  return subcategories;
}

module.exports.calculateHorizontalCategory = ({ height, width, subcategories, fitWidth, addInfoIcon = false }) => {
  const subcategoriesWithCalculations = computeItems(subcategories, addInfoIcon)
  const maxWidth = width - categoryTitleHeight - categoryBorder - (2 * subcategoryMargin - itemMargin + dividerWidth) * subcategories.length + dividerWidth
  const maxHeight = height - 2 * (subcategoryMargin + categoryBorder) + itemMargin - 2 * categoryBorder
  const maxColumns = Math.floor(maxWidth / (itemMargin + smallItemWidth))
  const maxRows = Math.floor((maxHeight + itemMargin) / (itemMargin + smallItemHeight))

  if (fitWidth) {
    return calculateHorizontalStretch({ subcategories: subcategoriesWithCalculations, maxWidth, maxHeight })
  }  else {
    return calculateHorizontalFixedWidth({ subcategories: subcategoriesWithCalculations, maxColumns, maxRows, fitWidth })
  }
}

module.exports.calculateVerticalCategory = ({ subcategories, fitWidth, width }) => {
  const subcategoriesWithCalculations = computeItems(subcategories)
  const maxColumns = Math.floor((width - 2 * (categoryBorder + itemMargin)) / (smallItemWidth + itemMargin))

  return subcategoriesWithCalculations.map(subcategory => {
    let columns = fitWidth ? Math.min(maxColumns, subcategory.allItems.length) : maxColumns
    if (columns % 2 === 1 && subcategory.largeItemsCount === subcategory.items.length) {
      columns -= 1
    }
    const subWidth = fitWidth ? width - 2 * categoryBorder : maxColumns * (smallItemWidth + itemMargin) - itemMargin
    const rows = Math.ceil(subcategory.itemsCount / columns)

    return { ...subcategory, columns, width: subWidth, rows }
  })
}
