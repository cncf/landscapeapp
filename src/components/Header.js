import React from 'react';
import { OutboundLink } from 'react-ga';
import settings from 'project/settings.yml';

const Header = ({reset}) => {
  return (
    <div className="header_container">
      <div className="header">
        <span className="landscape-logo"><img  onClick={reset} src="./images/left-logo.svg" /></span>
          <OutboundLink eventLabel="projet" to={settings.global.company_url} target="_blank" rel="noopener noreferrer" className="landscapeapp-logo">
    <img src="./images/right-logo.svg" />
  </OutboundLink>

      </div>
    </div>
  );
};

export default Header;
