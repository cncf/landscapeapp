import React from 'react'
import settings from 'public/settings.json'
import OutboundLink from './components/OutboundLink'
import assetPath from './utils/assetPath'

const OrganizationLogo = () => {
  const { short_name, company_url } = settings.global

  return <OutboundLink eventLabel={short_name} to={company_url} className="landscapeapp-logo" title={`${short_name} Home`}>
    <img src={assetPath("/images/right-logo.svg")} title={`${short_name} Logo`}/>
  </OutboundLink>
}

export default OrganizationLogo
