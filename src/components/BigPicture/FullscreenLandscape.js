import React from 'react';
import { pure } from 'recompose';
import LandscapeContent from './LandscapeContent';

const Fullscreen = ({ready, groupedItems, landscapeSettings, version}) => {
  if (ready !== true) {
    return (
      <div>
      </div>
    )
  }

  return (
    <div style={{zoom: 4, fontFamily: 'roboto'}}>
        <div className="gradient-bg" style={{
          width: landscapeSettings.fullscreen_size.width,
          height: landscapeSettings.fullscreen_size.height,
          position: 'relative'}}>
          <LandscapeContent style={{top: 50, left: 20}} groupedItems={groupedItems} zoom={1} landscapeSettings={landscapeSettings} />
          <div style={{
            position: 'absolute',
            top: 15,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 18,
            background: 'rgb(64,89,163)',
            color: 'white',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 3,
            paddingBottom: 3,
            borderRadius: 5
          }}>{landscapeSettings.fullscreen_header}</div>
          { !landscapeSettings.fullscreen_hide_grey_logos && <div style={{
            position: 'absolute',
            top: 15,
            right: 12,
            fontSize: 6,
            background: '#eee',
            color: 'rgb(100,100,100)',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 3,
            paddingBottom: 3,
            borderRadius: 5
          }}>Greyed logos are not open source</div> }
          <div style={{
            position: 'absolute',
            top: 10,
            left: 15,
            fontSize: 14,
            color: 'white',
          }}>{landscapeSettings.title} </div>
          <div style={{
            position: 'absolute',
            top: 30,
            left: 15,
            fontSize: 12,
            color: '#eee',
          }}>{version}</div>
        </div>
    </div>
  );
};

export default pure(Fullscreen);
