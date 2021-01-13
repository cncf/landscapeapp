import { parse } from 'querystring'
import settings from 'public/settings.json'
import { parseParams } from '../../utils/routing'
import getPrerenderProps from '../../utils/getPrerenderProps'
import { LandscapeProvider } from '../../contexts/LandscapeContext'
import HomePageComponent from '../../components/HomePage'

const defaultContentMode = settings.big_picture.main.url

const PrerenderedPage = ({ entries, pageParams }) => {
  return <LandscapeProvider entries={entries} pageParams={pageParams}>
    <HomePageComponent />
  </LandscapeProvider>
}

export async function getStaticProps(context) {
  const { page } = context.params
  const mapping = settings.prerender[page]
  const mainContentMode = mapping.split('?')[0].replace(/^\//, '') || defaultContentMode
  const queryParams = parse(mapping.split('?')[1])
  const pageParams = { mainContentMode, ...queryParams }

  const params = parseParams(pageParams)
  const props = getPrerenderProps(params)
  return { props: { ...props, pageParams } }
}

export async function getStaticPaths() {
  const paths = Object.entries(settings.prerender || {}).map(([name, _]) => `/pages/${name}`)

  return { paths, fallback: false }
}

export default PrerenderedPage
