import React from 'react'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import { getContrastRatio } from '@material-ui/core/styles'
import OutboundLink from './OutboundLink'
import assetPath from '../utils/assetPath'

const GuideLink = ({ color, identifier, label, fontSize = 18 }) => {
  const style = { width: fontSize, height: fontSize, display: 'block' }
  const ariaLabel = `Read more about ${label} on the guide`
  return <OutboundLink to={assetPath(`/guide#${identifier}`)} style={style} aria-label={ariaLabel}>
    <InfoIcon style={{
      color: !color || getContrastRatio('#ffffff', color) < 4.5 ? '#282828' : '#ffffff',
      fontSize
    }}/>
  </OutboundLink>
}

export default GuideLink
