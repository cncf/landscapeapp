import { parse, stringify } from 'querystring'

const convertLegacyUrl = url => {
  const { format, ...rest } = parse(url.replace(/^\//, ''))
  const path = `/${format || ''}`
  const query = stringify(rest)
  return [path, query].filter(_ => _).join('?')
}

export default convertLegacyUrl
