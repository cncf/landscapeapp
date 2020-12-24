import createSelector from '../utils/createSelector';
import ItemDialogButtons from './ItemDialogButtons';

import { changeSelectedItemId, closeDialog } from '../reducers/mainReducer';
import getGroupedItems, {getGroupedItemsForBigPicture } from '../utils/itemsCalculator';
import selectedItemCalculator from '../utils/selectedItemCalculator';
import { useContext } from 'react'
import EntriesContext from '../contexts/EntriesContext'

const getSelectedItem = createSelector(
  [ getGroupedItems,
    getGroupedItemsForBigPicture,
    (state) => state.main.selectedItemId,
    (state) => state.main.mainContentMode !== 'card'
  ],
  function(groupedItems,groupedItemsForBigPicture, selectedItemId, isBigPicture) {
    const selectedItemInfo = selectedItemCalculator(groupedItems, groupedItemsForBigPicture, selectedItemId, isBigPicture);
    return {
      hasSelectedItem: selectedItemInfo.hasSelectedItem,
      nextItemId: selectedItemInfo.nextItemId,
      previousItemId: selectedItemInfo.previousItemId
    };
  }
)

const ItemDialogButtonsConrainer = () => {
  const { selectedItem } = useContext(EntriesContext)
  // TODO add closeDialog
  // TODO add changeSelectedItemId
  // TODO add navigation to previous/next

  return <ItemDialogButtons hasSelectedItem={!!selectedItem} />
}

export default ItemDialogButtonsConrainer
