import React from 'react';
import { pure } from 'recompose';
import OutboundLink from './OutboundLink';
import settings from '../utils/settings.js';
import Link from 'next/link'

const Header = _ => {
  const { short_name, company_url, name } = settings.global;
  return (
    <div className="header_container">
      <div className="header">
        <span className="landscape-logo">
          <Link href="/">
            <img src="/images/left-logo.svg" alt={name}/>
          </Link>
        </span>
        <OutboundLink eventLabel={short_name} to={company_url} className="landscapeapp-logo" title={`${short_name} Home`}>
          <img src="/images/right-logo.svg" title={`${short_name} Logo`}/>
        </OutboundLink>

      </div>
    </div>
  );
};

export default pure(Header);
