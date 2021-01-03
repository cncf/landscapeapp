// locate zoom buttons
import IconButton from '@material-ui/core/IconButton';
import { pure } from 'recompose';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

import React, { useContext } from 'react';
import EntriesContext from '../../contexts/EntriesContext'

const FullscreenButton = _ => {
  const { navigate, params } = useContext(EntriesContext)
  const isBigPicture = params.mainContentMode !== 'card-mode'
  const { isFullscreen } = params

  if (!isBigPicture) {
    return null;
  }
  return <div className="fullscreen-button">
        { isFullscreen ?
        <IconButton onClick={_ => navigate({ isFullscreen: false })} title="Exit fullscreen">
          <FullscreenExitIcon />
        </IconButton>
          :
        <IconButton onClick={_ => navigate({ isFullscreen: true })} title="Enter fullscreen">
          <FullscreenIcon />
        </IconButton>
        }
  </div>
}
export default pure(FullscreenButton);
