import React from 'react';
import { pure } from 'recompose';
import Dialog from '@material-ui/core/Dialog';
import classNames from 'classnames'
import ItemDialogContent from './ItemDialogContent';
import ItemDialogButtonsContainer from './ItemDialogButtonsContainer';

import '../styles/itemModal.scss';

let lastItemInfo;

const ItemDialog = ({onClose, itemInfo}) => {
  const recentItemInfo = itemInfo || lastItemInfo || {};
  if (itemInfo) {
    lastItemInfo = itemInfo;
  }
  return (
      <Dialog open={!!itemInfo} onClose={() => onClose() } transitionDuration={400}
        classes={{paper:'modal-body'}}
        className={classNames('modal', 'product', {nonoss : recentItemInfo.oss === false})}>
        <div className="modal-content">
          { itemInfo && <ItemDialogButtonsContainer/> }
          { (itemInfo || lastItemInfo) && <ItemDialogContent itemInfo={itemInfo || lastItemInfo}/> }
        </div>
      </Dialog>
  );
}
export default pure(ItemDialog);
