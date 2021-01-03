import React, { useContext } from 'react';
import Link from 'next/link'
import isGoogle from '../utils/isGoogle';
import isModalOnly from '../utils/isModalOnly';
import EntriesContext from '../contexts/EntriesContext'

const InternalLink = ({to, children, onClick, className, ...other}) => {
  const { params } = useContext(EntriesContext)
  if (params.isEmbed || isGoogle() || isModalOnly() || !to) {
    return <span className={`${className}`} {...other}>{children}</span>;
  } else {
    return <Link href={to}>
      <a className={`${className} nav-link`} {...other}>{children}</a>
    </Link>
  }
}
export default InternalLink


