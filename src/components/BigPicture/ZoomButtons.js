// locate zoom buttons
import { pure } from 'recompose';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import AddCircleIcon from '@material-ui/icons/AddCircle';

import React from 'react';

const ZoomButtons = function({canZoomIn, canZoomOut, zoomText, onZoomIn, onZoomOut, onZoomReset}) {
  return <div className="zoom-buttons">
        <IconButton disabled={!canZoomOut} onClick={onZoomOut} className='zoom-change' title="Zoom out">
          <RemoveCircleIcon />
        </IconButton>
        <Button onClick={onZoomReset} className='zoom-reset' title="Reset zoom">{zoomText}</Button>
        <IconButton disabled={!canZoomIn} onClick={onZoomIn} className='zoom-change' title="Zoom in">
          <AddCircleIcon />
        </IconButton>
  </div>
}
export default pure(ZoomButtons);
