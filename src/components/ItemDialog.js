import React, { useContext } from 'react';
import { pure } from 'recompose';
import Dialog from '@material-ui/core/Dialog';
import classNames from 'classnames'
import ItemDialogContent from './ItemDialogContent';
import isModalOnly from "../utils/isModalOnly";
import ItemDialogButtons from './ItemDialogButtons'
import EntriesContext from '../contexts/EntriesContext'

const ItemDialog = _ => {
  const { selectedItem, navigate } = useContext(EntriesContext)
  const closeDialog = _ => isModalOnly() ? _ : navigate({ selectedItemId: null })
  return (
      <Dialog open={!!selectedItem} onClose={closeDialog} transitionDuration={400}
        classes={{paper:'modal-body'}}
        className={classNames('modal', 'product', {nonoss : selectedItem.oss === false})}>
          { !isModalOnly() && <ItemDialogButtons closeDialog={closeDialog} /> }
          { <ItemDialogContent itemInfo={selectedItem}/> }
      </Dialog>
  );
}
export default pure(ItemDialog);
