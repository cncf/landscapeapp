// locate zoom buttons
import { pure } from 'recompose';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import AddCircleIcon from '@material-ui/icons/AddCircle';

import React, { useContext } from 'react';
import { zoomLevels } from '../../utils/zoom'
import RootContext from '../../contexts/RootContext'
import EntriesContext from '../../contexts/EntriesContext'

const ZoomButtons = _ => {
  const { params } = useContext(RootContext)
  const { navigate } = useContext(EntriesContext)
  const { zoom } = params

  const minZoom = zoomLevels[0]
  const maxZoom = zoomLevels.slice(-1)[0]
  const zoomIndex = zoomLevels.indexOf(zoom)

  const canZoomOut = zoom !== minZoom
  const canZoomIn = zoom !== maxZoom
  const zoomText = Math.round(zoom * 100) + '%'
  const setZoom = zoom => navigate({ zoom: zoom })
  const zoomIn = _ => setZoom(zoomLevels[zoomIndex + 1] || maxZoom)
  const zoomOut = _ => setZoom(zoomLevels[zoomIndex - 1] || minZoom)
  const resetZoom = _ => setZoom()

  return <div className="zoom-buttons">
        <IconButton disabled={!canZoomOut} onClick={zoomOut} className='zoom-change' title="Zoom out">
          <RemoveCircleIcon />
        </IconButton>
        <Button onClick={resetZoom} className='zoom-reset' title="Reset zoom">{zoomText}</Button>
        <IconButton disabled={!canZoomIn} onClick={zoomIn} className='zoom-change' title="Zoom in">
          <AddCircleIcon />
        </IconButton>
  </div>
}

export default pure(ZoomButtons);
