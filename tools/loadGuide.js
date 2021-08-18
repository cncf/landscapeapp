import path from 'path'
import { existsSync, readFileSync } from 'fs'
import { load } from 'js-yaml'
import { Converter } from 'showdown'
import sanitizeHtml from 'sanitize-html'
import traverse from 'traverse'
import assetPath from '../src/utils/assetPath'
import { landscape } from './landscape'
import saneName from '../src/utils/saneName'

const categories = landscape.landscape

const projectPath = process.env.PROJECT_PATH || path.resolve('../..')
const guidePath = path.resolve(projectPath, 'guide', 'index.yml')

const converter = new Converter({ simpleLineBreaks: false, tables: true, parseImgDimensions: true })

const allowedTags = [...sanitizeHtml.defaults.allowedTags, 'img']

const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'width', 'height'] }

const transformTags = {
  img: (tagName, attribs) => {
    const src = attribs.src.indexOf('/') === 0 ? assetPath(attribs.src) : attribs.src
    return {
      tagName,
      attribs: { ...attribs, src }
    }
  },
  a: (tagName, attribs) => {
    const isExternal =  attribs.href.indexOf('/') !== 0
    const extra = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    return {
      tagName,
      attribs: { ...attribs, ...extra }
    }
  }
}

const markdownToHtml = (text) => {
  const html = converter.makeHtml(text)

  return sanitizeHtml(html, { allowedTags, allowedAttributes, transformTags })
}

const getPermalink = node => {
  if (!node.category && !node.subcategory) {
    return null
  }

  const category = categories.find(category => category.name === node.categoryName || node.title)

  if (!category) {
    throw new Error(`Could not create guide. Category not found: ${node.title}`)
  }

  const subcategory = node.subcategory ? category.subcategories.find(subcategory => subcategory.name === node.title) : null

  if (node.subcategory && !subcategory) {
    throw new Error(`Could not create guide. Subcategory not found: ${node.title}`)
  }

  const resource = subcategory || category

  return saneName(resource.name)
}

const getParentNode = context => {
  const { parent } = context

  if (!parent) {
    return {}
  }

  return !Array.isArray(parent.node) ? parent.node : parent.parent.node
}

const loadGuide = () => {
  if (!existsSync(guidePath)) {
    return null
  }

  const guideContent = load(readFileSync(guidePath))

  return traverse(guideContent).map(function(node) {
    const parentNode = getParentNode(this)
    const level = (parentNode.level || 0) + (node.title ? 1 : 0)
    const identifier = [parentNode.identifier, (node.title || '').replace(/\W/g, " ").trim().replace(/\s+/g, '-')]
      .filter(_ => _)
      .join('--')
      .toLowerCase()
    const permalink = getPermalink(node)
    const attrs = {
      ...node,
      ...(node.category && { categoryName: node.title }),
      ...(permalink && { permalink }),
      level,
      identifier
    }
    if (node.file) {
      const fileContent = readFileSync(path.resolve(projectPath, 'guide', node.file), 'utf-8')
      return { ...attrs, content: markdownToHtml(fileContent), isText: true }
    } else if (!this.isLeaf && !Array.isArray(node)) {
      return { ...attrs }
    }
  })
}

export default loadGuide
