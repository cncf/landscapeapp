import { parseParams } from '../../utils/routing'
import getPrerenderProps from '../../utils/getPrerenderProps'
import FullscreenLandscape from '../../components/BigPicture/FullscreenLandscape'
import { LandscapeProvider } from '../../contexts/LandscapeContext'
import { getLandscapeSettingsList } from '../../utils/landscapeSettings'


const FullscreenPage = ({ entries, mainContentMode }) => {
  return <LandscapeProvider entries={entries} pageParams={{ mainContentMode }}>
    <FullscreenLandscape />
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
  const paths = getLandscapeSettingsList(settings)
    .map(({ basePath }) => ['/fullscreen', basePath].filter(_ => _).join('/'))

  return { paths, fallback: false }
}

export default FullscreenPage
