import React from 'react';
import { NavLink } from 'react-router-dom';
import settings from 'project/settings.yml';

const Presets = () => {
  const normalizeUrl = function(url) {
    if (url.indexOf('/') === 0) {
      return url.substring(1);
    }
    return url;

  }
  return (
    <div className="sidebar-presets">
      <h4>Example filters:</h4>{settings.presets.map( entry => (
        <div key={entry.url}><NavLink className="preset" activeClassName="active" to={normalizeUrl(entry.url)}>{entry.label}</NavLink></div>
    ))}
    </div>
  )
};
export default Presets;
