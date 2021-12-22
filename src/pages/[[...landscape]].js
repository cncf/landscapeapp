import { readFileSync, existsSync } from 'fs'
import { LandscapeProvider } from '../contexts/LandscapeContext'
import HomePageComponent from '../components/HomePage'
import { parseParams } from '../utils/routing'
import getPrerenderProps from '../utils/getPrerenderProps'
import { getLandscapeSettingsList } from '../utils/landscapeSettings'

const loadGuideIndex = () => {
  if (!existsSync('public/guide.json')) {
    return null;
  }

  const guide = JSON.parse(readFileSync('public/guide.json', 'utf-8'))

  return guide
    .filter(section => section.landscapeKey)
    .reduce((accumulator, { category, subcategory, anchor }) => {
      const key = [category, subcategory].filter(_ => _).join(' / ')
      return { ...accumulator, [key]: anchor }
    }, {})
}

const LandscapePage = ({ entries, mainContentMode, guideIndex }) => {
  return <LandscapeProvider entries={entries} pageParams={{ mainContentMode }} guideIndex={guideIndex}>
    <HomePageComponent />
  </LandscapeProvider>
}

export async function getStaticProps(context) {
  const settings = JSON.parse(readFileSync('public/settings.json', 'utf-8'))
  const guideIndex = loadGuideIndex()
  const defaultContentMode = settings.big_picture.main.url
  const mainContentMode = (context.params.landscape || [])[0] || defaultContentMode

  const params = parseParams({ mainContentMode })
  const props = getPrerenderProps(params)
  return { props: { ...props, mainContentMode, guideIndex } }
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
