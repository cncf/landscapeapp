import React, { useContext } from 'react';
import { pure } from 'recompose';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyHandler from 'react-key-handler';
import EntriesContext from '../contexts/EntriesContext'


const ItemDialogButtons = ({ closeDialog }) => {
  const { navigate, nextItemId, previousItemId } = useContext(EntriesContext)
  const onSelectItem = selectedItemId => navigate({ selectedItemId })
  return (
    <div className='modal-buttons'>
          { nextItemId && <KeyHandler keyValue="ArrowRight" onKeyHandle={() => onSelectItem(nextItemId)} /> }
          { previousItemId && <KeyHandler keyValue="ArrowLeft" onKeyHandle={() => onSelectItem(previousItemId)} /> }
          <a className="modal-close" onClick={closeDialog}>×</a>
          <span className="modal-prev" disabled={!previousItemId} onClick={(e) => {e.stopPropagation(); onSelectItem(previousItemId)}}>
            <ChevronLeftIcon style={{ fontSize:'1.2em'}} />
          </span>
          <span className="modal-next" disabled={!nextItemId} onClick={(e) => {e.stopPropagation(); onSelectItem(nextItemId)}}>
            <ChevronRightIcon style={{ fontSize:'1.2em'}} />
          </span>
    </div>
  );
}
export default pure(ItemDialogButtons);
