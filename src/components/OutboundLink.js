import React from 'react';
import { OutboundLink } from 'react-ga';

export default ({to, eventLabel, children, ...props}) => {
  return (
    <OutboundLink to={to} eventLabel={eventLabel || to} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </OutboundLink>
  )
}
