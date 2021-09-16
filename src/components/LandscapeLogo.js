import React from 'react'
import InternalLink from './InternalLink'
import assetPath from '../utils/assetPath'
import settings from 'public/settings.json';

const LandscapeLogo = () => {
  const { name } = settings.global

  return <span className="landscape-logo">
    <InternalLink to="/">
      <img src={assetPath("/images/left-logo.svg")} alt={name}/>
    </InternalLink>
  </span>
}

export default LandscapeLogo
