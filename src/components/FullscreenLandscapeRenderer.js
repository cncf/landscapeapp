import React, { Fragment } from 'react';
import ReactDOMServer from 'react-dom/server';
import { calculateSize } from "../utils/landscapeCalculations";
import _ from 'lodash';

const headerHeight = 40;
export function render({landscapeSettings, landscapeContent, version}) {
  const { fullscreenWidth, fullscreenHeight } = calculateSize(landscapeSettings);
  const zoom = 1;
  return ReactDOMServer.renderToStaticMarkup(
      <div className="gradient-bg" style={{
        width: fullscreenWidth,
        height: fullscreenHeight,
        overflow: 'hidden'
        }}>
        <div className="inner-landscape" style={{
          width: fullscreenWidth,
          height: fullscreenHeight,
          paddingTop: headerHeight + 20,
          paddingLeft: 20,
          position: 'relative',
        }}>
          { landscapeContent }
          <div style={{
            position: 'absolute',
            top: 10,
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
            fontSize: 11,
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
}
