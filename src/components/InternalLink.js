import React, { useContext } from 'react';
import Link from 'next/link'
import isGoogle from '../utils/isGoogle';
import EntriesContext from '../contexts/EntriesContext'

const InternalLink = ({to, children, onClick, className, ...other}) => {
  const { params } = useContext(EntriesContext)
  if (params.isEmbed || isGoogle() || params.onlyModal || !to) {
    return <span className={`${className}`} {...other}>{children}</span>;
  } else {
    // TODO: re-enable shallow routing if possible
    return <Link href={to} prefetch={false}>
      <a className={`${className} nav-link`} {...other}>{children}</a>
    </Link>
  }
}
export default InternalLink


