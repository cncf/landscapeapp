import React, { useContext } from 'react';
import { pure } from 'recompose';
import Dialog from '@material-ui/core/Dialog';
import classNames from 'classnames'
import ItemDialogContent from './ItemDialogContent';


import ItemDialogButtons from './ItemDialogButtons'
import EntriesContext from '../contexts/EntriesContext'

const ItemDialog = _ => {
  const { selectedItem, navigate, params } = useContext(EntriesContext)
  const { onlyModal } = params
  const closeDialog = _ => onlyModal ? _ : navigate({ selectedItemId: null })
  return (
      <Dialog open={!!selectedItem} onClose={closeDialog} transitionDuration={400}
        classes={{paper:'modal-body'}}
        className={classNames('modal', 'product', {nonoss : selectedItem.oss === false})}>
          { !onlyModal && <ItemDialogButtons closeDialog={closeDialog} /> }
          { <ItemDialogContent itemInfo={selectedItem}/> }
      </Dialog>
  );
}
export default pure(ItemDialog);
