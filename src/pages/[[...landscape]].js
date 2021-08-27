import { readFileSync, existsSync } from 'fs'
import { LandscapeProvider } from '../contexts/LandscapeContext'
import HomePageComponent from '../components/HomePage'
import { parseParams } from '../utils/routing'
import getPrerenderProps from '../utils/getPrerenderProps'
import { getLandscapeSettingsList } from '../utils/landscapeSettings'

const loadGuideMap = () => {
  if (!existsSync('public/guide.json')) {
    return {}
  }

  const guide = JSON.parse(readFileSync('public/guide.json', 'utf-8'))

  return guide.content
    .filter(section => section.category)
    .reduce((accumulator, { title, content, identifier }) => {
      const subcategories = content.filter(section => section.subcategory)
        .reduce((accumulator, { title, identifier }) => {
          return { ...accumulator, [title]: { identifier } }
        }, {})
      return { ...accumulator, [title]: { title, identifier, subcategories } }
    }, {})
}

const LandscapePage = ({ entries, mainContentMode, guideMap }) => {
  return <LandscapeProvider entries={entries} pageParams={{ mainContentMode }} guideMap={guideMap}>
    <HomePageComponent />
  </LandscapeProvider>
}

export async function getStaticProps(context) {
  const settings = JSON.parse(readFileSync('public/settings.json', 'utf-8'))
  const guideMap = loadGuideMap()
  const defaultContentMode = settings.big_picture.main.url
  const mainContentMode = (context.params.landscape || [])[0] || defaultContentMode

  const params = parseParams({ mainContentMode })
  const props = getPrerenderProps(params)
  return { props: { ...props, mainContentMode, guideMap } }
}

export async function getStaticPaths() {
  const settings = JSON.parse(readFileSync('public/settings.json', 'utf-8'))
  const basePaths = getLandscapeSettingsList(settings)
    .filter(({ isMain }) => !isMain)
    .map(({ basePath }) => `/${basePath}`)

  const paths = ['/', '/card-mode', ...basePaths]

  return { paths, fallback: false }
}

export default LandscapePage
