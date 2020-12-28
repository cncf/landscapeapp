import React, { useContext } from 'react';
import Link from 'next/link'
import isGoogle from '../utils/isGoogle';
import isModalOnly from '../utils/isModalOnly';
import RootContext from '../contexts/RootContext'

const InternalLink = ({to, children, onClick, className, ...other}) => {
  const { params } = useContext(RootContext)
  if (params.isEmbed || isGoogle() || isModalOnly() || !to) {
    return <span className={`${className}`} {...other}>{children}</span>;
  } else {
    return <Link href={to}>
      <a className={`${className} nav-link`} {...other}>{children}</a>
    </Link>
  }
}
export default InternalLink


