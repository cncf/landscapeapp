import React from 'react';
import Link from 'next/link'
import isEmbed from '../utils/isEmbed';
import isGoogle from '../utils/isGoogle';
import isModalOnly from '../utils/isModalOnly';

const InternalLink = ({to, children, onClick, className, ...other}) => {
  if (isEmbed() || isGoogle() || isModalOnly() || !to) {
    return <span className={`${className}`} {...other}>{children}</span>;
  } else {
    return <Link href={to}>
      <a className={`${className} nav-link`} {...other}>{children}</a>
    </Link>
  }
}
export default InternalLink


