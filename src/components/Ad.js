import React from 'react';
import { pure } from 'recompose';
import OutboundLink from './OutboundLink';
import settings from 'public/settings.json';
import assetPath from '../utils/assetPath'

const Ad = () => {
  const entries = settings.ads || [];

  return <div id="kubecon">
    { entries.map( (entry) => (
        <OutboundLink className="sidebar-event" key={entry.image} to={entry.url} title={entry.title}>
            <img src={assetPath(entry.image)} alt={entry.title} />
        </OutboundLink>
    )) }
  </div>
}
export default pure(Ad);
