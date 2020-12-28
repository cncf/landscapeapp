import { useRouter } from 'next/router'
import CssBaseline from '@material-ui/core/CssBaseline'
import Head from 'next/head'
import RootContext from '../contexts/RootContext'
import '../styles/roboto.css'
import '../styles/theme.css'
import '../styles/itemModal.css'
import settings from '../utils/settings'
import routeToParams from '../utils/routeToParams'

export const initialState = {
  data: null,
  ready: false,
  initialUrlHandled: false,
  filters: {
    relation: [],
    stars: null,
    license: [],
    marketCap: null,
    organization: [],
    headquarters: [],
    landscape: [],
    bestPracticeBadgeId: null,
    enduser: null,
    language: undefined, // null means no language
    parents: [],
  },
  grouping: 'relation',
  sortField: 'name',
  sortDirection: 'asc',
  selectedItemId: null,
  mainContentMode: settings.big_picture.main.url, // also landscape or serverless for a big picture
  zoom: 1,
  isFullscreen: false
};

export default function App({ Component, pageProps }) {
  const params = routeToParams()

  return <>
    <Head>
      {/*<title>CNCF Radars</title>*/}
      {/*<meta name="viewport" content="width=device-width, initial-scale=1"/>*/}
      {/*<link rel="icon" href="/favicon.png"/>*/}
    </Head>

    {/* TODO: not sure why we need initial state */}
    <RootContext.Provider value={{ params: { ...initialState, ...params } }}>
      <CssBaseline />
      <main>
        <Component {...pageProps} />
      </main>
    </RootContext.Provider>
  </>
}
