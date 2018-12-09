import React from 'react';
import { OutboundLink } from 'react-ga';
import settings from 'project/settings.yml'

const Footer = () => {
  return <div style={{ marginTop: 10, fontSize:'9pt', width: '100%', textAlign: 'center' }}>
    Crunchbase data is used under license from Crunchbase to ${settings.global.short_name}. For more information, please see the <OutboundLink eventLabel="crunchbase-terms" to={`https://github.com/${settings.global.repo}/blob/master/README.md#license`} target="_blank">license</OutboundLink> info.
  </div>
}
export default Footer;
