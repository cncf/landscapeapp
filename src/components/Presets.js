import React from 'react';
import { NavLink } from 'react-router-dom';
import settings from 'project/settings.yml';

const Presets = () => {
  return (
    <div className="sidebar-presets">
      <h4>Example filters:</h4>{settings.presets.map( entry => (
      <div key={entry.url}><NavLink className="preset" activeClassName="active" to={entry.url}>{entry.label}</NavLink></div>
    ))}
    </div>
  )
};
export default Presets;
