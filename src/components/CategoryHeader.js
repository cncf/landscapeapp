import React from 'react'
import css from 'styled-jsx/css'
import GuideLink from './GuideLink'
import { categoryTitleHeight } from '../utils/landscapeCalculations'
import InternalLink from './InternalLink'
import { getContrastRatio } from '@material-ui/core/styles'

const CategoryHeader = ({ href, label, guideAnchor, background, rotate = false }) => {
  const lowContrast = getContrastRatio('#ffffff', background) < 4.5
  const color = lowContrast ? '#282828' : '#ffffff'
  const backgroundColor = lowContrast ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
  const infoEl = css.resolve`
    a {
      width: ${categoryTitleHeight - 4}px;
      height: ${categoryTitleHeight - 4}px;
      margin: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      color: ${color};
      background: ${backgroundColor};
      transform: ${rotate ? 'rotate(180deg)' : 'none'};
    }

    a:hover {
      color: ${color};
      background: none;
    }

    a :global(svg) {
      stroke: ${color};
    }
  `

  const linkEl = css.resolve`
    a {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      width: 100%;
      flex: 1;
      font-size: 12px;
      color: ${color};
      background: none;
    }

    a:hover {
      font-weight: bold;
      background: ${backgroundColor};
    }
  `

  return <>
    {infoEl.styles}
    {linkEl.styles}

    <InternalLink to={href} className={linkEl.className}>{label}</InternalLink>

    { guideAnchor && <GuideLink label={label} anchor={guideAnchor} className={infoEl.className} /> }
  </>
}

export default CategoryHeader
