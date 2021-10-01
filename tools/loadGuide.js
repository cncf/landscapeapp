import path from 'path'
import { existsSync, readFileSync } from 'fs'
import cheerio from 'cheerio'
import { Converter } from 'showdown'
import sanitizeHtml from 'sanitize-html'
import assetPath from '../src/utils/assetPath'
import { landscape } from './landscape'
import saneName from '../src/utils/saneName'

const categories = landscape.landscape

const projectPath = process.env.PROJECT_PATH || path.resolve('../..')
const guidePath = path.resolve(projectPath, 'guide.md')

const converter = new Converter({ simpleLineBreaks: false, tables: true, parseImgDimensions: true })

const allowedTags = [...sanitizeHtml.defaults.allowedTags, 'img']

const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'width', 'height', 'alt'] }

const allowedClasses = {
  p: ['MuiTypography-paragraph'],
  h1: ['MuiTypography-h1'],
  h2: ['MuiTypography-h2'],
  h3: ['MuiTypography-h3'],
  h4: ['MuiTypography-h4'],
  h5: ['MuiTypography-h5']
}

const transformToMUI = suffix => {
  return (tagName, attribs) => {
    return { tagName, attribs: { ...attribs, class: `MuiTypography-${suffix}` } }
  }
}

const transformTags = {
  img: (tagName, attribs) => {
    const src = attribs.src.indexOf('/') === 0 ? assetPath(attribs.src) : attribs.src
    const alt = src.split('/').pop()
    return {
      tagName,
      attribs: { ...attribs, src, alt }
    }
  },
  a: (tagName, attribs) => {
    const isExternal =  attribs.href.indexOf('/') !== 0
    const extra = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    return {
      tagName,
      attribs: { ...attribs, ...extra }
    }
  },
  p: transformToMUI('paragraph'),
  h1: transformToMUI('h1'),
  h2: transformToMUI('h2'),
  h3: transformToMUI('h3'),
  h4: transformToMUI('h4'),
  h5: transformToMUI('h5')
}

const markdownToHtml = (text) => {
  if (!text) {
    return ''
  }

  const html = converter.makeHtml(text)

  return sanitizeHtml(html, { allowedTags, allowedClasses, allowedAttributes, transformTags })
}

const getPermalink = (node, categoryName) => {
  if (!node.category && !node.subcategory) {
    return null
  }

  const category = categories.find(category => category.name === categoryName)

  if (!category) {
    throw new Error(`Could not create guide. Category not found: ${node.category}`)
  }

  const subcategory = node.subcategory ? category.subcategories.find(subcategory => subcategory.name === node.subcategory) : null

  if (node.subcategory && !subcategory) {
    throw new Error(`Could not create guide. Subcategory not found: ${node.subcategory}`)
  }

  const resource = subcategory || category

  return saneName(resource.name)
}

const parseGuide = () => {
  const $ = cheerio.load(readFileSync(guidePath));

  const sections = $('body')[0].children.map(node => {
    const text = $(node).text().trim()

    // TODO: validate only right data attributes are used
    if (text || node.name === 'section') {
      const attributes = node.attribs || {}
      const category = attributes['data-category']
      const subcategory = attributes['data-subcategory']
      const buzzwords = (attributes['data-buzzwords'] || '')
        .split(',')
        .filter(_ => _)
        .map(str => str.trim())

      return { text, category, subcategory, buzzwords }
    }
  })

  return sections.filter(_ => _)
}

const loadGuide = () => {
  if (!existsSync(guidePath)) {
    return null
  }

  const guideSections = parseGuide()

  let lastCategory = null

  return guideSections.map(section => {
    if (section.category) {
      lastCategory = section.category
    } else if (!section.subcategory) {
      lastCategory = null
    }

    const permalink = getPermalink(section, lastCategory)
    const level = section.category ? 1 : (section.subcategory && 2)
    const title = section.category || section.subcategory
    const content = markdownToHtml(section.text)
    const anchor = [lastCategory, section.subcategory && title]
        .filter(_ => _)
        .map(str => str.replace(/\W/g, " ").trim().replace(/\s+/g, '-'))
        .join('--')
        .toLowerCase()

    return { ...section, permalink, title, level, content, anchor, category: lastCategory }
  })
}

export default loadGuide
