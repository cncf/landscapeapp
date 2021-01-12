import React, { useContext } from 'react';
import Link from 'next/link'
import isGoogle from '../utils/isGoogle';
import LandscapeContext from '../contexts/LandscapeContext'

const InternalLink = ({to, children, onClick, className, ...other}) => {
  const { params } = useContext(LandscapeContext)
  if (params.isEmbed || isGoogle() || params.onlyModal || !to) {
    return <span className={`${className}`} {...other}>{children}</span>;
  } else {
    return <Link href={to} prefetch={false}>
      <a className={`${className} nav-link`} {...other}>{children}</a>
    </Link>
  }
}
export default InternalLink


