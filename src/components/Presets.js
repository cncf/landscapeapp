import React from 'react'
import { parse } from 'query-string'
import { useRouter } from 'next/router'
import { pure } from 'recompose'
import InternalLink from './InternalLink'
import convertLegacyUrl from '../utils/convertLegacyUrl'
import settings from 'public/settings.json'

const queriesMatch = (query, otherQuery) => {
  const params = parse(query)
  const otherParams = parse(otherQuery)

  for (const key in params) {
    if (params[key] !== otherParams[key]) {
      return false
    }
  }

  return true
}

const urlsMatch = (url, otherUrl) => {
  const [path, query] = url.split('?')
  const [otherPath, otherQuery] = otherUrl.split('?')

  if (path !== otherPath) {
    return false
  }

  return queriesMatch(query, otherQuery)
}

const presets = settings.presets.map(preset => {
  const url = preset.url.indexOf('=') >= 0 ? convertLegacyUrl(preset.url) : preset.url
  return { ...preset, url: url[0] === '/' ? url : `/${url}` }
})

const Preset = ({ preset }) => {
  const router = useRouter()
  const active = urlsMatch(preset.url, router.asPath)

  return <div>
    <InternalLink className={`preset ${active ? 'active' : null}`} to={preset.url}>
      {preset.label}
    </InternalLink>
  </div>
}

const Presets = () => {
  return <div className="sidebar-presets">
    <h4>Example filters:</h4>
    {presets.map(preset => <Preset key={preset.url} preset={preset} />)}
  </div>
}

export default pure(Presets);
