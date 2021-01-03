import React, { useContext } from 'react';
import { pure } from 'recompose';
import OutboundLink from './OutboundLink';
import EntriesContext from '../contexts/EntriesContext'
import paramsToRoute from '../utils/paramsToRoute'

const EmbeddedFooter = () => {
  const { params } = useContext(EntriesContext)
  const url = paramsToRoute({ ...params, isEmbed: null })
  return <h1 style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>
    <OutboundLink to={url}>View</OutboundLink> the full interactive landscape
  </h1>
}
export default pure(EmbeddedFooter);
