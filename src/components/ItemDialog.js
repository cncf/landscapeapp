import React from 'react';
import { pure } from 'recompose';
import Dialog from '@material-ui/core/Dialog';
import classNames from 'classnames'
import ItemDialogContent from './ItemDialogContent';
import isModalOnly from "../utils/isModalOnly";
import ItemDialogButtons from './ItemDialogButtons'

const ItemDialog = ({onClose, itemInfo}) => {
  const closeDialog = isModalOnly() ? _ => _ : onClose
  return (
      <Dialog open={!!itemInfo} onClose={closeDialog} transitionDuration={400}
        classes={{paper:'modal-body'}}
        className={classNames('modal', 'product', {nonoss : itemInfo.oss === false})}>
          { !isModalOnly() && <ItemDialogButtons onClose={onClose} /> }
          { <ItemDialogContent itemInfo={itemInfo}/> }
      </Dialog>
  );
}
export default pure(ItemDialog);
