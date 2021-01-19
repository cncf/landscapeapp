import React, { useContext } from 'react';
import { pure } from 'recompose';
import OutboundLink from './OutboundLink';
import LandscapeContext from '../contexts/LandscapeContext'
import { stringifyParams } from '../utils/routing'

const EmbeddedFooter = () => {
  const { params } = useContext(LandscapeContext)
  const url = stringifyParams({ ...params, isEmbed: null })
  return <h1 style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>
    <OutboundLink to={url}>View</OutboundLink> the full interactive landscape
  </h1>
}
export default pure(EmbeddedFooter);
