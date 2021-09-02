import React, { useContext } from 'react';
import { pure } from 'recompose';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyHandler from 'react-key-handler';
import LandscapeContext from '../contexts/LandscapeContext'


const ItemDialogButtons = ({ closeDialog }) => {
  const { navigate, nextItemId, previousItemId } = useContext(LandscapeContext)
  const onSelectItem = selectedItemId => navigate({ selectedItemId }, { scroll: false })
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
