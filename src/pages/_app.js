import { CssBaseline, Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import Head from 'next/head'
import '../styles/theme.css'
import '../styles/guide.css'
import '../styles/itemModal.css'
import '../styles/verificationModal.css'
import settings from 'public/settings.json';
import ReactGA from 'react-ga';
import iframeResizerContentWindow from 'iframe-resizer/js/iframeResizer.contentWindow';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import isBrowser from '../utils/isBrowser'
import useCurrentDevice from '../utils/useCurrentDevice'
import { parse } from 'query-string'
import 'fontsource-roboto/latin.css'

const Notice = ({ onClose, notice }) => {
  const anchorOrigin = { vertical: 'top', horizontal: 'center' }
  return <Snackbar open={true} autoHideDuration={6000} onClose={_ => onClose(null)} anchorOrigin={anchorOrigin}>
    <Alert onClose={_ => onClose(null)} severity={notice.severity} variant="filled">
      {notice.message}
    </Alert>
  </Snackbar>
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const description = `${settings.global.meta.description}. Updated: ${process.env.lastUpdated}`
  const favicon = `${settings.global.website}/images/favicon.png`
  const [notice, setNotice] = useState(null)
  const currentDevice = useCurrentDevice()
  // TODO: hydration fix
  const ready = !isBrowser() || router.isReady

  useEffect(() => {
    window.landscapeRouter = router;
    window.addEventListener('message', function(event) {
      var data = event.data;
      if (data.type === "css") {
        var styles = data.css;
        var el = document.createElement('style');
        el.type = 'text/css';
        if (el.styleSheet) {
          el.styleSheet.cssText = styles;
        } else {
          el.appendChild(document.createTextNode(styles));
        }
        document.getElementsByTagName("head")[0].appendChild(el);
      }
      if (data.type === "js") {
        eval(data.js);
      }
    });
    const params = parse(window.location.search);
    if (params.css) {
      var element = document.createElement("link");
      element.setAttribute("rel", "stylesheet");
      element.setAttribute("type", "text/css");
      element.setAttribute("href", params.css);
      document.getElementsByTagName("head")[0].appendChild(element);
    }
    if (params.style) {
      var element = document.createElement("style");
      try {
        params.style = JSON.parse(params.style)
      } catch(ex) {

      }
      element.innerHTML = params.style;
      document.getElementsByTagName("head")[0].appendChild(element);
    }
  }, []);

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
    function updateOrientation() {
      if (window.matchMedia("(orientation: portrait)").matches) {
        document.querySelector('html').classList.remove('landscape');
        document.querySelector('html').classList.add('portrait');
      } else {
        document.querySelector('html').classList.remove('portrait');
        document.querySelector('html').classList.add('landscape');
      }
    }

    if (!currentDevice.desktop()) {
      window.addEventListener('orientationchange', updateOrientation);
      return () => window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [currentDevice])

  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

      <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>

      <title>{settings.global.meta.title}</title>
      <meta name="description" content={ description } />

      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta charSet="utf-8"/>
      <meta property="og:locale" content="en_US"/>
      <meta property="og:type" content="website"/>
      <meta property="og:title" content={settings.global.meta.title}/>
      <meta property="og:description" content={ description }/>
      <meta property="og:url" content={[settings.global.website, router.asPath].join('')}/>
      <meta property="og:site_name" content={settings.global.meta.title}/>
      <meta property="fb:admins" content={settings.global.meta.fb_admin}/>
      <meta property="og:image" content={favicon} />
      <meta property="og:image:secure_url" content={favicon} />
      <meta name="twitter:card" content="summary"/>
      <meta name="twitter:site" content={settings.global.meta.twitter}/>
      <meta name="twitter:creator" content={settings.global.meta.twitter}/>
      <meta name="google-site-verification" content={settings.global.meta.google_site_verification}/>
      <meta name="msvalidate.01" content={settings.global.meta.ms_validate}/>

      <link rel="icon" href={favicon} />
    </Head>

    <CssBaseline />
    <main>
      { notice && <Notice onClose={_ => setNotice(null)} notice={notice} /> }
      { ready ? <Component {...pageProps} setNotice={setNotice} /> : null }
    </main>

    {/*
       TODO: this is a temporary fix to prevent hydration from happening if the query string is set.
       Hydrating component when query string is set makes loading rendering the page slower,
       because hydration happens without the query params and after that the page is rendered with the params.
       See if there's a better way to accomplish the same.
   */}
    <script dangerouslySetInnerHTML={{__html: "location.search.length > 0 ? document.querySelector('main').innerHTML = '' : null;" }} />
  </>
}
