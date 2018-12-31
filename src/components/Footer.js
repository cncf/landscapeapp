import React from 'react';
import { pure } from 'recompose';
import { OutboundLink } from 'react-ga';
import settings from 'project/settings.yml'

const Footer = () => {
  return <div style={{ marginTop: 10, fontSize:'9pt', width: '100%', textAlign: 'center' }}>
    {settings.home.footer} For more information, please see the <OutboundLink eventLabel="crunchbase-terms" to={`https://github.com/${settings.global.repo}/blob/master/README.md#license`} target="_blank">license</OutboundLink> info.
  </div>
}
export default pure(Footer);
