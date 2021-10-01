import React from 'react'
import css from 'styled-jsx/css'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import OutboundLink from './OutboundLink'
import assetPath from '../utils/assetPath'

const GuideLink = ({ anchor, label, className="" }) => {
  const ariaLabel = `Read more about ${label} on the guide`
  const to = assetPath(`/guide#${anchor}`)

  const svgEl = css.resolve`
    svg {
      stroke-width: 0;
    }

    svg:hover {
      stroke-width: 0.5;
    }
  `

  return <OutboundLink className={className} to={to} aria-label={ariaLabel}>
    {svgEl.styles}
    <InfoIcon style={{ fontSize: 'inherit' }} className={svgEl.className}/>
  </OutboundLink>
}

export default GuideLink
