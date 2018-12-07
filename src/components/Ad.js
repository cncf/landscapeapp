import React from 'react';
import { OutboundLink } from 'react-ga';
import settings from 'project/settings.yml';

const Ad = () => {

  const entries = settings.ads;


  return <div id="kubecon">
    { entries.map( (entry) => (
        <OutboundLink className="sidebar-event"
            key={entry.image}
            eventLabel={entry.url}
            to={entry.url}
            target="_blank">
            <img src={entry.image} />
        </OutboundLink>
    )) }
  </div>
}
export default Ad;
