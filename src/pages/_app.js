import CssBaseline from '@material-ui/core/CssBaseline'
import Head from 'next/head'
import '../styles/roboto.css'
import '../styles/theme.scss'
import '../styles/itemModal.scss'
import settings from 'project/settings.yml';
import ReactGA from 'react-ga';
import iframeResizerContentWindow from 'iframe-resizer/js/iframeResizer.contentWindow';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import currentDevice from '../utils/currentDevice'


export default function App({ Component, pageProps }) {
  const router = useRouter()
  const description = `${settings.global.meta.description}. Updated: ${process.env.lastUpdated}`
  const favicon = `${settings.global.website}/favicon.png`

  useEffect(() => {
    ReactGA.initialize(process.env.GA)
    ReactGA.pageview(router.asPath)
    const handleRouteChange = url => ReactGA.pageview(url)
    router.events.on('routeChangeComplete', handleRouteChange)
    return _ => router.events.off('routeChangeComplete', handleRouteChange)
  }, [])

  useEffect(() => {
    // Remove the server-side injected CSS.
    // See https://github.com/mui-org/material-ui/tree/master/examples/nextjs
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  useEffect(() => {
    const el = document.querySelector('.landscape-wrapper');
    if (el) {
      var height = el.parentElement.clientHeight + window.innerHeight -
        document.body.offsetHeight;
      el.style.height = height + "px";
    }
  }, [])

  useEffect(() => {
    if (!currentDevice.desktop()) {
      window.addEventListener("orientationchange", updateOrientation);
      setInterval(updateOrientation, 1000);
    }

    function updateOrientation() {
      if (window.matchMedia("(orientation: portrait)").matches) {
        document.querySelector('html').classList.remove('landscape');
        document.querySelector('html').classList.add('portrait');
      } else {
        document.querySelector('html').classList.remove('portrait');
        document.querySelector('html').classList.add('landscape');
      }
    }
  }, [])

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

      {/* This is a hack to hide the page when navigating directly to an item and then show the page and the open modal at the same time */}
      <style dangerouslySetInnerHTML={{ __html: "html.really-hide-html { display: none; };"}} />
      <script dangerouslySetInnerHTML={{__html: "location.search.indexOf('selected') >= 0 ? document.documentElement.classList.add('really-hide-html') : null;" }} />

      <link rel="icon" href={favicon} />
    </Head>

    {/* TODO: add spinner */}
    <CssBaseline />
    <main>
      <Component {...pageProps} />
    </main>
  </>
}
