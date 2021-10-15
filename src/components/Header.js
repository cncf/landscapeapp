import React from 'react';
import { pure } from 'recompose';
import LandscapeLogo from './LandscapeLogo'
import OrganizationLogo from '../OrganizationLogo'

const Header = _ => {
  return (
    <div className="header_container">
      <div className="header">
        <LandscapeLogo />
        <OrganizationLogo />
      </div>
    </div>
  );
};

export default pure(Header);
