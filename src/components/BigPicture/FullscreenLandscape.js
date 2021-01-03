import React, { useContext, useEffect, useState } from 'react';
import LandscapeContent from './LandscapeContent';
import { calculateSize, outerPadding, headerHeight } from "../../utils/landscapeCalculations";
import currentDevice from '../../utils/currentDevice'
import { getGroupedItemsForBigPicture } from '../../utils/itemsCalculator'
import RootContext from '../../contexts/RootContext'
import EntriesContext from '../../contexts/EntriesContext'
import { findLandscapeSettings } from '../../utils/landscapeSettings'

const _calculateZoom = (boxWidth, boxHeight, zoomedIn) => {
  const isFirefox = navigator.userAgent.indexOf('Firefox') > -1

  const aspectRatio = innerWidth / innerHeight
  const adjustedWidth = outerWidth
  const adjustedHeight = adjustedWidth / aspectRatio
  let baseZoom = Math.min(adjustedHeight / boxHeight, adjustedWidth / boxWidth, 2).toPrecision(4)
  let wrapperWidth, wrapperHeight

  if (baseZoom <= 0.95 || !currentDevice.desktop() || isFirefox || location.search.indexOf('scale=false') > -1) {
    wrapperWidth = Math.max(boxWidth, innerWidth)
    wrapperHeight = Math.max(boxHeight, innerHeight)
    baseZoom = 1
  } else {
    wrapperWidth = adjustedWidth / baseZoom
    wrapperHeight = adjustedHeight / baseZoom
  }

  return { zoom: Math.min(baseZoom * (zoomedIn ? 3 : 1), 3), wrapperWidth, wrapperHeight }
}

// TODO: check version is set correctly (version: qs.parse(location.search).version)
const Fullscreen = ({version}) => {
  const { params } = useContext(RootContext)
  const { entries } = useContext(EntriesContext)
  const { mainContentMode } = params
  const landscapeSettings = findLandscapeSettings(mainContentMode)
  const groupedItems = getGroupedItemsForBigPicture(params, entries, landscapeSettings)

  const { width, height } = calculateSize(landscapeSettings)
  const boxHeight = height + headerHeight + 2 * outerPadding
  const boxWidth = width + 2 * outerPadding
  const [zoomState, setZoomState] = useState({
    zoom: 1,
    wrapperHeight: boxHeight,
    wrapperWidth: boxWidth,
    zoomedIn: false,
    zoomedAt: {}
  })
  const { zoom, wrapperHeight, wrapperWidth, zoomedIn, zoomedAt } = zoomState

  const calculateZoom = (zoomedIn = false, zoomedAt = {}) => {
    const zoomAttrs = _calculateZoom(boxWidth, boxHeight, zoomedIn)
    setZoomState({ zoomedIn, zoomedAt, ...zoomAttrs })
  }

  const onZoom = e => {
    const zoomedAt = { x: e.pageX / zoom, y: e.pageY / zoom }
    calculateZoom(!zoomedIn, zoomedAt)
  }

  useEffect(() => {
    calculateZoom()
    window.addEventListener("resize", calculateZoom)
    return () => window.removeEventListener("resize", calculateZoom)
  }, [true]);

  useEffect(() => {
    zoomedIn ? window.scrollTo((zoomedAt.x * zoom - innerWidth / 2), (zoomedAt.y * zoom - innerHeight / 2)) : null
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
            onClick={currentDevice.desktop() && onZoom}
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
          <LandscapeContent groupedItems={groupedItems} landscapeSettings={landscapeSettings} padding={0} />
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
