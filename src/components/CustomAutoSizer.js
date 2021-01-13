import { useContext, useEffect, useRef, useState } from 'react'
import LandscapeContext from '../contexts/LandscapeContext'
import useBrowserZoom from '../utils/useBrowserZoom'

const AutoSizer = ({ children }) => {
  const { params } = useContext(LandscapeContext)
  const { isFullscreen } = params
  const [height, setHeight] = useState('auto')
  const ref = useRef(null)
  const isZoomedIn = useBrowserZoom()
  const [resizedAt, setResizedAt] = useState(null)

  useEffect(() => {
    const onResize = _ => setResizedAt(new Date())
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const height = ref.current.clientHeight + window.innerHeight - document.body.offsetHeight
      setHeight(isZoomedIn ? 'auto' : height)
    }, 1)
  }, [isFullscreen, isZoomedIn, resizedAt])


  // Outer div should not force width/height since that may prevent containers from shrinking.
  // Inner component should overflow and use calculated width/height.
  // See issue #68 for more information.
  return <div ref={ref} style={{ overflow: 'visible', width: '100%' }}>
    {children({ height })}
  </div>
}

export default AutoSizer
