import React from 'react';
import { pure } from 'recompose';
import Dialog from '@material-ui/core/Dialog';
import classNames from 'classnames'
import _ from 'lodash';
import ItemDialogContent from './ItemDialogContent';
import ItemDialogButtonsContainer from './ItemDialogButtonsContainer';

import '../styles/itemModal.scss';
import fields from '../types/fields';
import isModalOnly from "../utils/isModalOnly";

let lastItemInfo;
function getRelationStyle(relation) {
  const relationInfo = _.find(fields.relation.values, {id: relation});
  if (relationInfo && relationInfo.color) {
    return {
      border: '4px solid ' + relationInfo.color
    };
  } else {
    return {};
  }
}

const ItemDialog = ({onClose, itemInfo}) => {
  const recentItemInfo = itemInfo || lastItemInfo || {};
  const closeDialog = isModalOnly ? _ => _ : onClose
  if (itemInfo) {
    lastItemInfo = itemInfo;
  }
  return (
      <Dialog open={!!itemInfo} onClose={closeDialog} transitionDuration={400}
        classes={{paper:'modal-body'}}
        className={classNames('modal', 'product', {nonoss : recentItemInfo.oss === false})}>
          { itemInfo && !isModalOnly && <ItemDialogButtonsContainer/> }
          { (itemInfo || lastItemInfo) && <ItemDialogContent itemInfo={itemInfo || lastItemInfo}/> }
      </Dialog>
  );
}
export default pure(ItemDialog);
