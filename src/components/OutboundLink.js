import React from 'react';
import { OutboundLink } from 'react-ga';

const OverrideOutboundLink = ({to, eventLabel, children, ...props}) => {
  return (
    <OutboundLink to={to} eventLabel={eventLabel || to} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </OutboundLink>
  )
}

export default OverrideOutboundLink
