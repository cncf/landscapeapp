import { LandscapeProvider } from '../contexts/LandscapeContext'
import HomePageComponent from '../components/HomePage'
import { parseParams } from '../utils/routing'
import getPrerenderProps from '../utils/getPrerenderProps'
import { getLandscapeSettingsList } from '../utils/landscapeSettings'


const LandscapePage = ({ entries, mainContentMode }) => {
  return <LandscapeProvider entries={entries} pageParams={{ mainContentMode }}>
    <HomePageComponent />
  </LandscapeProvider>
}

export async function getStaticProps(context) {
  const settings = JSON.parse(require('fs').readFileSync('public/settings.json', 'utf-8'));
  const defaultContentMode = settings.big_picture.main.url
  const mainContentMode = (context.params.landscape || [])[0] || defaultContentMode

  const params = parseParams({ mainContentMode })
  const props = getPrerenderProps(params)
  return { props: { ...props, mainContentMode } }
}

export async function getStaticPaths() {
  const settings = JSON.parse(require('fs').readFileSync('public/settings.json', 'utf-8'));
  const basePaths = getLandscapeSettingsList(settings)
    .filter(({ isMain }) => !isMain)
    .map(({ basePath }) => `/${basePath}`)

  const paths = ['/', '/card-mode', ...basePaths]

  return { paths, fallback: false }
}

export default LandscapePage
