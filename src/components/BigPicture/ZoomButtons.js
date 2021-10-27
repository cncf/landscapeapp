// locate zoom buttons
import { pure } from 'recompose';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import AddCircleIcon from '@material-ui/icons/AddCircle';

import React, { useContext } from 'react';
import { zoomLevels } from '../../utils/zoom'
import LandscapeContext from '../../contexts/LandscapeContext'

const ZoomButtons = _ => {
  const { navigate, params } = useContext(LandscapeContext)
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
        <IconButton disabled={!canZoomOut} onClick={zoomOut} className='zoom-change' title="Zoom out" size="small">
          <RemoveCircleIcon />
        </IconButton>
        <Button onClick={resetZoom} className='zoom-reset' title="Reset zoom" size="small">{zoomText}</Button>
        <IconButton disabled={!canZoomIn} onClick={zoomIn} className='zoom-change' title="Zoom in" size="small">
          <AddCircleIcon />
        </IconButton>
  </div>
}

export default pure(ZoomButtons);
