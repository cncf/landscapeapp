import React from 'react';
import { pure } from 'recompose';
import OutboundLink from './OutboundLink';
import settings from 'public/settings.json'

const Footer = () => {
  return <div style={{ marginTop: 10, fontSize:'9pt', width: '100%', textAlign: 'center' }}>
    {settings.home.footer} For more information, please see the&nbsp;
    <OutboundLink eventLabel="crunchbase-terms" to={`https://github.com/${settings.global.repo}/blob/HEAD/README.md#license`}>
      license
    </OutboundLink> info.
  </div>
}
export default pure(Footer);
