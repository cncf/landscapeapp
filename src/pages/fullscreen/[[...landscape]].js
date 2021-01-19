import { parseParams } from '../../utils/routing'
import getPrerenderProps from '../../utils/getPrerenderProps'
import FullscreenLandscape from '../../components/BigPicture/FullscreenLandscape'
import { LandscapeProvider } from '../../contexts/LandscapeContext'
import { landscapeSettingsList } from '../../utils/landscapeSettings'
import settings from 'public/settings.json'

const defaultContentMode = settings.big_picture.main.url

const FullscreenPage = ({ entries, mainContentMode }) => {
  return <LandscapeProvider entries={entries} pageParams={{ mainContentMode }}>
    <FullscreenLandscape />
  </LandscapeProvider>
}

export async function getStaticProps(context) {
  const mainContentMode = (context.params.landscape || [])[0] || defaultContentMode
  const params = parseParams({ mainContentMode })
  const props = getPrerenderProps(params)
  return { props: { ...props, mainContentMode } }
}

export async function getStaticPaths() {
  const paths = landscapeSettingsList
    .map(({ basePath }) => ['/fullscreen', basePath].filter(_ => _).join('/'))

  return { paths, fallback: false }
}

export default FullscreenPage
