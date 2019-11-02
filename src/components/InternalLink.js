import React from 'react';
import { pure } from 'recompose';
import isEmbed from '../utils/isEmbed';
import isGoogle from '../utils/isGoogle';
import { NavLink } from 'react-router-dom';
const skipDefaultHandler = (e) => e.preventDefault();
const InternalLink = ({to, children, onClick, className, ...other}) => {
  if (onClick) {
    other.onClick = function(e) {
      skipDefaultHandler(e);
      onClick();
    };
  }
  if (isEmbed || isGoogle || !to) {
    return <span className={`${className}`} {...other}>{children}</span>;
  } else {
    return <NavLink className={`${className}  nav-link`} {...other} to={to}>{children}</NavLink>
  }
}
export default pure(InternalLink);


