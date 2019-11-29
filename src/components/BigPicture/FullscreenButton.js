// locate zoom buttons
import IconButton from '@material-ui/core/IconButton';
import { pure } from 'recompose';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

import React from 'react';

const FullscreenButton = function({isVisible, isFullscreen, enableFullscreen, disableFullscreen}) {
  if (!isVisible) {
    return null;
  }
  return <div className="fullscreen-button">
        { isFullscreen ?
        <IconButton onClick={disableFullscreen} title="Exit fullscreen">
          <FullscreenExitIcon />
        </IconButton>
          :
        <IconButton onClick={enableFullscreen} title="Enter fullscreen">
          <FullscreenIcon />
        </IconButton>
        }
  </div>
}
export default pure(FullscreenButton);
