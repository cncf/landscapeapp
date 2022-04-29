import React from 'react'
import GuideLink from './GuideLink'
import { categoryTitleHeight } from '../utils/landscapeCalculations'
import getContrastRatio from 'get-contrast-ratio'

const InternalLink = ({to, className, children, ...props}) =>
  (<a data-type="internal" href={to} className={className} {...props}>{children}</a>)

const CategoryHeader = ({ href, label, guideAnchor, background, rotate = false }) => {
  const lowContrast = getContrastRatio('#ffffff', background) < 4.5
  const color = lowContrast ? '#282828' : '#ffffff'
  const backgroundColor = lowContrast ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
  // const infoEl = css.resolve`
    // a {
    // }

    // a:hover {
      // color: ${color};
      // background: none;
    // }

    // a :global(svg) {
      // stroke: ${color};
    // }
  // `

  return <>
    <InternalLink to={href} style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%',
      flex: 1,
      fontSize: '12px',
      color: color,
      background: 'none'
    }}>{label}</InternalLink>
    { guideAnchor && <
      GuideLink label={label} anchor={guideAnchor} style={{
        width: categoryTitleHeight - 4,
        height: categoryTitleHeight - 4,
        margin: '2px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '18px',
        color: color,
        background: backgroundColor,
        transform: rotate ? 'rotate(180deg)' : 'none'
      }}
    /> }
    </>
}

export default CategoryHeader
