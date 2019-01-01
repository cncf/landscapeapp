import React from 'react';
import { pure } from 'recompose';
import { OutboundLink } from 'react-ga';
import settings from 'project/settings.yml';

const Ad = () => {

  const entries = settings.ads;
  const normalizeUrl = function(url) {
    if (url.indexOf('/') === 0) {
      return url.substring(1);
    }
    return url;
  }


  return <div id="kubecon">
    { entries.map( (entry) => (
        <OutboundLink className="sidebar-event"
            key={entry.image}
            eventLabel={entry.url}
            to={entry.url}
            target="_blank">
            <img src={normalizeUrl(entry.image)} />
        </OutboundLink>
    )) }
  </div>
}
export default pure(Ad);
