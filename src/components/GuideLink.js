import React from 'react'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import { getContrastRatio } from '@material-ui/core/styles'
import OutboundLink from './OutboundLink'

const GuideLink = ({ color, identifier, fontSize = 18 }) => {
  return <OutboundLink to={`/guide#${identifier}`} style={{ width: fontSize, height: fontSize, display: 'block' }}>
    <InfoIcon style={{
      color: !color || getContrastRatio('#ffffff', color) < 4.5 ? '#282828' : '#ffffff',
      fontSize
    }}/>
  </OutboundLink>
}

export default GuideLink
