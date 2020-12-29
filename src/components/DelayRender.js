import { useEffect, useState } from 'react'

const DelayRender = ({ delay = 1000, content }) => {
  const [ready, setReady] = useState(false)

  useEffect(_ => {
    const timeout = setTimeout(_ => setReady(true), delay)
    return _ => clearTimeout(timeout)
  }, [])

  return ready ? content() : null
}

export default DelayRender
