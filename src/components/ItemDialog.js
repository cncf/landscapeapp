import React, { useContext } from 'react';
import { pure } from 'recompose';
import Dialog from '@material-ui/core/Dialog';
import classNames from 'classnames'
import ItemDialogContent from './ItemDialogContent';
import VerificationItemDialogContent from './VerificationItemDialogContent';
import ItemDialogButtons from './ItemDialogButtons'
import LandscapeContext from '../contexts/LandscapeContext'
import useSWR from 'swr'
import assetPath from '../utils/assetPath'

const fetchItem = itemId => useSWR(itemId ? assetPath(`/data/items/${itemId}.json`) : null)

const ItemDialog = _ => {
  const { navigate, params, entries } = useContext(LandscapeContext)
  const { onlyModal, selectedItemId } = params
  const { data: selectedItem } = fetchItem(selectedItemId)
  const closeDialog = _ => onlyModal ? _ : navigate({ selectedItemId: null }, { scroll: false })
  const nonoss = selectedItem && selectedItem.oss === false
  const loading = selectedItemId && !selectedItem
  const itemInfo = selectedItem || entries.find(({ id }) => id === selectedItemId)
  const Component = itemInfo && itemInfo.tag === 'verification' ? VerificationItemDialogContent : ItemDialogContent

  return (
      <Dialog open={!!selectedItemId} onClose={closeDialog} transitionDuration={400}
        classes={{paper:'modal-body'}}
        className={classNames('modal', 'product', {nonoss})}>
          { !onlyModal && <ItemDialogButtons closeDialog={closeDialog} /> }
          <Component itemInfo={itemInfo} loading={loading}/>
      </Dialog>
  );
}
export default pure(ItemDialog);
