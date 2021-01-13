import { LandscapeProvider } from '../contexts/LandscapeContext'
import HomePageComponent from '../components/HomePage'
import { parseParams } from '../utils/routing'
import getPrerenderProps from '../utils/getPrerenderProps'
import { landscapeSettingsList } from '../utils/landscapeSettings'
import settings from 'project/settings.yml'

const defaultContentMode = settings.big_picture.main.url

const LandscapePage = ({ entries, mainContentMode }) => {
  return <LandscapeProvider entries={entries} pageParams={{ mainContentMode }}>
    <HomePageComponent />
  </LandscapeProvider>
}

export async function getStaticProps(context) {
  const mainContentMode = (context.params.landscape || [])[0] || defaultContentMode

  const params = parseParams({ mainContentMode })
  const props = getPrerenderProps(params)
  return { props: { ...props, mainContentMode } }
}

export async function getStaticPaths() {
  const basePaths = landscapeSettingsList
    .filter(({ isMain }) => !isMain)
    .map(({ basePath }) => `/${basePath}`)

  const paths = ['/', '/card-mode', ...basePaths]

  return { paths, fallback: false }
}

export default LandscapePage
