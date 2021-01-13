import _ from 'lodash';

export default function selectedItemCalculator(groupedItems, selectedItemId, isBigPicture) {
    const calcItems = function() {
      if (!isBigPicture) {
        return groupedItems.flatMap(group => group.items)
      }
      // if we are in a big picture mode, we want to allow prev/next button to work only inside a given category
      const itemsByCategory = groupedItems.map(category => category.subcategories.flatMap(subcategory => subcategory.items))
      return itemsByCategory.find(items => items.find(item => item.id === selectedItemId)) || []
    }
    const items = calcItems();
    const index = _.findIndex(items, {id: selectedItemId});
    const item = items[index];
    const nextItem = items[index + 1];
    const previousItem = items[index - 1];
    return {
      itemInfo: item,
      hasSelectedItem: !!item,
      nextItemId: (nextItem || {id: null}).id,
      previousItemId: (previousItem || {id: null}).id
    };
  }
