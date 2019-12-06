import React from 'react';
import { pure } from 'recompose';
import OutboundLink from './OutboundLink';

const EmbeddedFooter = () => {
  const originalLink = window.location.pathname.replace('&embed=yes', '').replace('&embed=true', '');
  return <h1 style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>
    <OutboundLink to={originalLink}>View</OutboundLink> the full interactive landscape
  </h1>
}
export default pure(EmbeddedFooter);
