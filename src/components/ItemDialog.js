import React, { useContext, useEffect } from 'react';
import { pure } from 'recompose';
import Dialog from '@material-ui/core/Dialog';
import classNames from 'classnames'
import ItemDialogContent from './ItemDialogContent';
import CircularProgress from '@material-ui/core/CircularProgress'
import ItemDialogButtons from './ItemDialogButtons'
import EntriesContext from '../contexts/EntriesContext'
import useSWR from 'swr'
import assetPath from '../utils/assetPath'

const fetchItem = itemId => useSWR(itemId ? assetPath(`/data/${itemId}.json`) : null)

const LoadingModal = () =>  <div className="modal-content">
  <style jsx>{`
    .modal-content {
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
    }
  `}</style>
  <CircularProgress />
</div>


const ItemDialog = _ => {
  const { navigate, params } = useContext(EntriesContext)
  const { onlyModal, selectedItemId } = params
  const { data: selectedItem } = fetchItem(selectedItemId)
  const closeDialog = _ => onlyModal ? _ : navigate({ selectedItemId: null })
  const nonoss = selectedItem && selectedItem.oss === false
  const loading = selectedItemId && !selectedItem

  useEffect(() => {
    const { classList } = document.documentElement
    if (selectedItemId && classList.contains('really-hide-html')) {
      classList.remove('really-hide-html')
    }
  }, [])

  return (
      <Dialog open={!!selectedItemId} onClose={closeDialog} transitionDuration={400}
        classes={{paper:'modal-body'}}
        className={classNames('modal', 'product', {nonoss})}>
          { !onlyModal && <ItemDialogButtons closeDialog={closeDialog} /> }
          { loading ? <LoadingModal /> : <ItemDialogContent itemInfo={selectedItem}/> }
      </Dialog>
  );
}
export default pure(ItemDialog);
