import createSelector from '../utils/createSelector';
import ItemDialog from './ItemDialog';

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
      itemInfo: selectedItemInfo.itemInfo,
    };
  }
)

const ItemDialogContainer = () => {
  // TODO check selectedItemCalculator to find next/previous item
  // TODO add changeSelectedItemId
  const { selectedItem, navigate } = useContext(EntriesContext)

  return <ItemDialog itemInfo={selectedItem} onClose={navigate} />
}

export default ItemDialogContainer
