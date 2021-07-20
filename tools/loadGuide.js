import path from 'path'
import { existsSync, readFileSync } from 'fs'
import { load } from 'js-yaml'
import { Converter } from 'showdown'
import sanitizeHtml from 'sanitize-html'
import traverse from 'traverse'

const projectPath = process.env.PROJECT_PATH || path.resolve('../..')
const guidePath = path.resolve(projectPath, 'guide.yml')

const converter = new Converter({ simpleLineBreaks: false, tables: true })
const allowedTags = [...sanitizeHtml.defaults.allowedTags, 'img']

const markdownToHtml = (text) => {
  const html = converter.makeHtml(text)

  return sanitizeHtml(html, { allowedTags })
}

const loadGuide = () => {
  if (!existsSync(guidePath)) {
    return null
  }

  const guideContent = load(readFileSync(guidePath))

  return traverse(guideContent).map(function(node) {
    const parentNode = this.parent && this.parent.node || {}
    const level = (parentNode.level || 0) + (node.title ? 1 : 0)
    const identifier = [parentNode.identifier, (node.title || '').replace(/\W/g, " ").trim().replace(/\s+/g, '-')]
      .filter(_ => _)
      .join('--')
      .toLowerCase()
    const attrs = { ...node, level, identifier }
    if (typeof node.content === 'string') {
      return { ...attrs, content: markdownToHtml(node.content), isText: true }
    } else if (!this.isLeaf) {
      return { ...attrs }
    }
  })
}

export default loadGuide
