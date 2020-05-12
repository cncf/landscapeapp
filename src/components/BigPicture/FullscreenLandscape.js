import React, { useEffect, useState } from 'react';
import { pure } from 'recompose';
import LandscapeContent from './LandscapeContent';
import { calculateSize, outerPadding, headerHeight } from "../../utils/landscapeCalculations";
import isDesktop from "../../utils/isDesktop";

const calculateZoom = (width, height) => {
  if (!isDesktop || location.search.indexOf('zoom=false') > -1) {
    return 1
  }

  const aspectRatio = innerWidth / innerHeight

  // Hack to detect browser zoom on Firefox, otherwise outerWidth increases with zoom while on other browser it remains constant.
  // Device pixel ratio returns 1 on Safari
  const adjustedWidth = devicePixelRatio === 1 ? outerWidth : innerWidth * (devicePixelRatio || 1)
  const adjustedHeight = adjustedWidth / aspectRatio
  const targetHeight = adjustedHeight - headerHeight - outerPadding
  const targetWidth = adjustedWidth - outerPadding

  return Math.min(targetHeight / height, targetWidth / width).toPrecision(4)
}

const Fullscreen = ({ready, groupedItems, landscapeSettings, version}) => {
  if (ready !== true) {
    return <div></div>
  }

  const [_, setWindowSize] = useState(1);

  useEffect(() => {
    const calculateWindowSize = () => setWindowSize(`${innerWidth}x${innerHeight}`)
    window.addEventListener("resize", calculateWindowSize)
    return () => window.removeEventListener("resize", calculateWindowSize)
  }, );

  const { width, height } = calculateSize(landscapeSettings)

  const zoom = calculateZoom(width, height)
  const verticalPadding = Math.max(innerHeight - headerHeight - height * zoom, outerPadding) / 2
  const horizontalPadding = Math.max(innerWidth - width * zoom, outerPadding) / 2
  const wrapperWidth = Math.floor(width * zoom + 2 * horizontalPadding)
  const wrapperHeight = Math.floor(height * zoom + 2 * verticalPadding + headerHeight)

  return (
    <div style={{fontFamily: 'roboto', zoom: 1}}>
        <div className="gradient-bg" style={{
          width: wrapperWidth,
          height: wrapperHeight,
          paddingTop: headerHeight,
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative'}}>
          <LandscapeContent groupedItems={groupedItems} zoom={zoom} landscapeSettings={landscapeSettings} horizontalPadding={horizontalPadding} verticalPadding={verticalPadding} />
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
};

export default pure(Fullscreen);
