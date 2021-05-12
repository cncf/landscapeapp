import React, { useContext, useEffect, useState } from 'react';
import LandscapeContent from './LandscapeContent';
import useCurrentDevice from '../../utils/useCurrentDevice'
import { useRouter } from 'next/router'
import LandscapeContext from '../../contexts/LandscapeContext'
import { headerHeight} from '../../utils/landscapeCalculations'

const _calculateZoom = (fullscreenWidth, fullscreenHeight, zoomedIn, currentDevice) => {
  const isFirefox = navigator.userAgent.indexOf('Firefox') > -1

  const aspectRatio = innerWidth / innerHeight
  const adjustedWidth = outerWidth
  const adjustedHeight = adjustedWidth / aspectRatio
  let baseZoom = Math.min(adjustedHeight / fullscreenHeight, adjustedWidth / fullscreenWidth, 2).toPrecision(4)
  let wrapperWidth, wrapperHeight

  if (isFirefox || location.search.indexOf('scale=false') > -1) {
    wrapperWidth = Math.max(fullscreenWidth, innerWidth)
    wrapperHeight = Math.max(fullscreenHeight, innerHeight)
    baseZoom = 1
  } else {
    wrapperWidth = adjustedWidth / baseZoom
    wrapperHeight = adjustedHeight / baseZoom
  }

  return { zoom: Math.min(baseZoom * (zoomedIn ? 3 : 1), 3), wrapperWidth, wrapperHeight }
}

const Fullscreen = _ => {
  const { version } = useRouter().query
  const { fullscreenWidth, fullscreenHeight, landscapeSettings } = useContext(LandscapeContext)
  const currentDevice = useCurrentDevice()

  const [zoomState, setZoomState] = useState({
    zoom: 1,
    wrapperHeight: fullscreenHeight,
    wrapperWidth: fullscreenWidth,
    zoomedIn: false,
    zoomedAt: {}
  })
  const { zoom, wrapperHeight, wrapperWidth, zoomedIn, zoomedAt } = zoomState

  const calculateZoom = (zoomedIn = false, zoomedAt = {}) => {
    const zoomAttrs = _calculateZoom(fullscreenWidth, fullscreenHeight, zoomedIn, currentDevice)
    setZoomState({ zoomedIn, zoomedAt, ...zoomAttrs })
  }

  const onZoom = e => {
    const zoomedAt = { x: e.pageX / zoom, y: e.pageY / zoom }
    calculateZoom(!zoomedIn, zoomedAt)
  }

  useEffect(() => {
    if (currentDevice.ready && currentDevice.desktop()) {
      calculateZoom()
      const onResize = _ => calculateZoom()
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
  }, [currentDevice]);

  useEffect(() => {
    window.scrollTo((zoomedAt.x * zoom - innerWidth / 2), (zoomedAt.y * zoom - innerHeight / 2))
  }, [zoomedAt, zoomedIn])

  return (
      <div className="gradient-bg" style={{
        width: wrapperWidth * zoom,
        height: wrapperHeight * zoom,
        overflow: 'hidden'
        }}>
        <div style={{
          transform: `scale(${zoom})`,
          width: wrapperWidth,
          height: wrapperHeight,
          transformOrigin: '0 0',
          paddingTop: headerHeight,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div
            onClick={e => currentDevice.desktop() && onZoom(e)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              cursor: zoomedIn ? 'zoom-out' : 'zoom-in',
              zIndex: 100000
            }}>
          </div>
          <LandscapeContent padding={0} />
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

export default Fullscreen
