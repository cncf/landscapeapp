import settings from 'project/settings.yml'
import fields from "../types/fields";

export const itemMargin = 3
export const smallItemWidth = 34
export const smallItemHeight = 30
export const largeItemWidth = 2 * smallItemWidth + itemMargin
export const largeItemHeight = 2 * smallItemHeight + itemMargin
export const subcategoryMargin = 6
export const subcategoryTitleHeight = 20
export const dividerWidth = 2
export const categoryBorder = 1
export const categoryTitleHeight = 30
export const outerPadding = 20
export const headerHeight = 40

// Check if item is large
const isLargeFn = ({ relation, category, member }) => {
  const relationInfo = fields.relation.values.find(({ id }) => id === relation);
  if (category === settings.global.membership) {
    const membershipInfo = settings.membership[member];
    return membershipInfo && !!membershipInfo.is_large;
  }
  return !!relationInfo.big_picture_order;
}

// Compute if items are large and/or visible.
// Count number of items, large items count for 4 small items.
// Count number of large items.
const computeItems = subcategories => {
  return subcategories.map(subcategory => {
    const filteredItems = subcategory.items.reduce((acc, { id }) => ({ ...acc, [id]: true }), {})
    const allItems = subcategory.allItems.map(item => ({ ...item, isLarge: isLargeFn(item), isVisible: filteredItems[item.id]  }))
    const itemsCount = allItems.reduce((count, item) => count + (item.isLarge ? 4 : 1), 0)
    const largeItemsCount = allItems.reduce((count, item) => count + (item.isLarge ? 1 : 0), 0)

    return { ...subcategory, allItems, itemsCount, largeItemsCount }
  })
}

// Calculate width and height of a given landscape
export const calculateSize = landscapeSettings => {
  return {
    width: Math.max(...landscapeSettings.elements.map(({ left, width }) => left + width)),
    height: Math.max(...landscapeSettings.elements.map(({ top, height }) => top + height))
  }
}

// Calculate each subcategory width and the disposition of its items, assuming fixed padding for each item.
const calculateHorizontalFixedWidth = ({ subcategories, maxColumns, maxRows, fitWidth }) => {
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
      while (availableColumns > 0 && (!nextSubcategory || subcategory.rows >= nextSubcategory.rows)) {
        subcategory.columns += 1
        subcategory.rows =  Math.ceil(subcategory.itemsCount / subcategory.columns)
        availableColumns -= 1
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

  return subcategories
}

export const calculateHorizontalCategory = ({ height, width, subcategories, fitWidth }) => {
  const subcategoriesWithCalculations = computeItems(subcategories)
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

export const calculateVerticalCategory = ({ subcategories, fitWidth, width }) => {
  const subcategoriesWithCalculations = computeItems(subcategories)
  const maxColumns = Math.floor((width - 2 * (categoryBorder + itemMargin)) / (smallItemWidth + itemMargin))

  return subcategoriesWithCalculations.map(subcategory => {
    let columns = Math.min(maxColumns, subcategory.allItems.length)
    if (columns % 2 === 1 && subcategory.largeItemsCount === subcategory.items.length) {
      columns -= 1
    }
    const subWidth = fitWidth ? width - 2 * categoryBorder : maxColumns * (smallItemWidth + itemMargin) - itemMargin

    return { ...subcategory, columns, width: subWidth }
  })
}
