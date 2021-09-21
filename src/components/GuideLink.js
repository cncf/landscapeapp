import React from 'react'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import { getContrastRatio } from '@material-ui/core/styles'
import OutboundLink from './OutboundLink'
import assetPath from '../utils/assetPath'

const GuideLink = ({ identifier, label, className="", fontSize = 18 }) => {
  const ariaLabel = `Read more about ${label} on the guide`
  const to = assetPath(`/guide#${identifier}`)
  return <OutboundLink className={`${className} guide-info-link`} to={to} aria-label={ariaLabel}>
    <InfoIcon style={{
      fontSize
    }}/>
  </OutboundLink>
}

export default GuideLink
