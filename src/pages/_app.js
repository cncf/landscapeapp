import CssBaseline from '@material-ui/core/CssBaseline'
import Head from 'next/head'
import '../styles/roboto.css'
import '../styles/theme.scss'
import '../styles/itemModal.scss'
import settings from 'project/settings.yml';
import ReactGA from 'react-ga';
import iframeResizerContentWindow from 'iframe-resizer/js/iframeResizer.contentWindow';
import isBrowser from '../utils/isBrowser'
import { useEffect, useState } from 'react'

// TODO: old index.js had the require below
// require('favicon.png'); // Tell webpack to load favicon.png

export default function App({ Component, pageProps }) {
  const pageEntries = pageProps.entries && pageProps.entries.length > 0 ? pageProps.entries : []
  const [savedEntries, _] = useState(pageEntries)
  const entries = pageEntries.length > 0 ? pageEntries : savedEntries

  const description = `${settings.global.meta.description}. Updated: ${process.env.lastUpdated}`
  const favicon = `${settings.global.website}/favicon.png`

  if (isBrowser()) {
    ReactGA.initialize(process.env.GA)
    // TODO: track page view, probably use next.js router routeChangeComplete
    // ReactGA.pageview(window.location.pathname + window.location.search)
    // history.listen(location => ReactGA.pageview(location.pathname + window.location.search))
  }

  useEffect(() => {
    // Remove the server-side injected CSS.
    // See https://github.com/mui-org/material-ui/tree/master/examples/nextjs
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  // TODO: check if the code below is necessary
  useEffect(() => {
    document.addEventListener("DOMContentLoaded", function() {
      const el = document.querySelector('.landscape-wrapper');
      if (el) {
        var height = el.parentElement.clientHeight + window.innerHeight -
          document.body.offsetHeight;
        el.style.height = height + "px";
      } else {
        console.info('No el to adjust');
      }
    })
  }, [])


  // TODO: check if the code below is necessary
  //   // Event listener to determine change (horizontal/portrait)
  //   if (!currentDevice.desktop()) {
  //     window.addEventListener("orientationchange", updateOrientation);
  //     setInterval(updateOrientation, 1000);
  //   }
  //   function updateOrientation() {
  //     if (window.matchMedia("(orientation: portrait)").matches) {
  //       document.querySelector('html').classList.remove('landscape');
  //       document.querySelector('html').classList.add('portrait');
  //     } else {
  //       document.querySelector('html').classList.remove('portrait');
  //       document.querySelector('html').classList.add('landscape');
  //     }
  //   }

  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

      <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>

      <title>{settings.global.meta.title}</title>

      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta charSet="utf-8"/>
      <meta property="og:locale" content="en_US"/>
      <meta property="og:type" content="website"/>
      <meta property="og:title" content={settings.global.meta.title}/>
      <meta property="og:url" content={settings.global.website}/>
      <meta property="og:site_name" content={settings.global.meta.title}/>
      <meta property="fb:admins" content={settings.global.meta.fb_admin}/>
      <meta property="og:image" content={favicon} />
      <meta property="og:image:secure_url" content={favicon} />
      <meta name="twitter:card" content="summary"/>
      <meta name="twitter:title" content={settings.global.meta.title}/>
      <meta name="twitter:description" content={ description }/>
      <meta name="twitter:site" content={settings.global.meta.facebook}/>
      <meta name="twitter:image" content={favicon} />
      <meta name="twitter:creator" content={settings.global.meta.facebook}/>
      <meta name="description" content={ description } />
      <meta name="google-site-verification" content={settings.global.meta.google_site_verification}/>
      <meta name="msvalidate.01" content={settings.global.meta.ms_validate}/>

      <link rel="icon" href={favicon} />
    </Head>

    {/* TODO: add spinner */}
    <CssBaseline />
    <main>
      <Component {...{...pageProps, entries}} />
    </main>
  </>
}
