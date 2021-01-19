import { parse, stringify } from 'querystring'

const convertLegacyUrl = url => {
  const { format, ...rest } = parse(url.replace(/^\//, ''))
  const styleAttrs = ['logo-mode', 'flat-mode'].includes(format) ? { style: format.split('-')[0] } : {}
  const basePath = styleAttrs.style ? 'card-mode' : format
  const path = `/${basePath || ''}`
  const query = stringify({ ...rest, ...styleAttrs })
  return [path, query].filter(_ => _).join('?')
}

export default convertLegacyUrl
