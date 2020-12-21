import Head from 'next/head'
import RootContext from '../contexts/RootContext'
import '../styles/itemModal.css'

export default function App({ Component, pageProps }) {
  return <>
    <Head>
      {/*<title>CNCF Radars</title>*/}
      {/*<meta name="viewport" content="width=device-width, initial-scale=1"/>*/}
      {/*<link rel="icon" href="/favicon.png"/>*/}
    </Head>

    <RootContext.Provider value={[]}>
      <main>
        <Component {...pageProps} />
      </main>
    </RootContext.Provider>
  </>
}
