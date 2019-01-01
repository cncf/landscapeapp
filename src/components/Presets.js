import React from 'react';
import { pure } from 'recompose';
import { NavLink } from 'react-router-dom';

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
        <div key={preset.url}><NavLink className="preset" isActive={() => preset === activePreset} activeClassName="active" to={normalizeUrl(preset.url)}>{preset.label}</NavLink></div>
    ))}
    </div>
  )
};
export default pure(Presets);
