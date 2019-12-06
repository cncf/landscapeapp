import React from 'react';
import { pure } from 'recompose';
import OutboundLink from './OutboundLink';
import settings from 'project/settings.yml';

const Header = ({ reset }) => {
  const { short_name, company_url, name } = settings.global;
  return (
    <div className="header_container">
      <div className="header">
        <span className="landscape-logo"><img onClick={reset} src="./images/left-logo.svg" alt={name}/></span>
        <OutboundLink eventLabel={short_name} to={company_url} className="landscapeapp-logo" title={`${short_name} Home`}>
          <img src="./images/right-logo.svg" title={`${short_name} Logo`}/>
        </OutboundLink>

      </div>
    </div>
  );
};

export default pure(Header);
