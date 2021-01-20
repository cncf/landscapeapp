import { parse, stringify } from 'querystring'

const convertLegacyUrl = url => {
  const { format, ...rest } = parse(url.replace(/^\//, ''))
  const styleAttrs = format && format.indexOf('-mode') > 0 && format !== 'card-mode' ? { style: format.split('-')[0] } : {}
  const basePath = styleAttrs.style ? 'card-mode' : format
  const path = `/${basePath || ''}`
  const query = stringify({ ...rest, ...styleAttrs })
  return [path, query].filter(_ => _).join('?')
}

export default convertLegacyUrl
