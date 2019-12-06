import React from 'react';
import { pure } from 'recompose';
import OutboundLink from './OutboundLink';
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
        <OutboundLink className="sidebar-event" key={entry.image} to={entry.url} title={entry.title}>
            <img src={normalizeUrl(entry.image)} alt={entry.title} />
        </OutboundLink>
    )) }
  </div>
}
export default pure(Ad);
