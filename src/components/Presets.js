import React from 'react'
import { pure } from 'recompose'
import InternalLink from './InternalLink'

const Presets = ({presets, activePreset}) => {
  const normalizeUrl = function(url) {
    if (url.indexOf('/') === 0) {
      return url.substring(1);
    }
    return url;

  }
  return (
    <div className="sidebar-presets">
      <h4>Example filters:</h4>{presets.map( preset => (
        <div key={preset.url}>
          <InternalLink className={`preset ${preset === activePreset ? 'active' : null}`} to={normalizeUrl(preset.url)}>
            {preset.label}
          </InternalLink>
        </div>
    ))}
    </div>
  )
};
export default pure(Presets);
