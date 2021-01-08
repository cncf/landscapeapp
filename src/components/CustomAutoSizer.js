import { useContext, useEffect, useRef, useState } from 'react'
import EntriesContext from '../contexts/EntriesContext'
import { isZoomedIn } from '../utils/browserZoom'

const AutoSizer = ({ children }) => {
  const { params } = useContext(EntriesContext)
  const { isFullscreen } = params
  const [height, setHeight] = useState('auto')
  const ref = useRef(null)

  const checkedZoomedIn = (e) => {
    const windowHeight = window.innerHeight;
    onResize()

    for (let i = 1; i < 11; i++) {
      const timeout = i * 50;

      setTimeout(() => {
        if (window.innerHeight !== windowHeight) {
          onResize()
        }
      }, timeout)
    }
  }

  const onResize = () => {
    setTimeout(() => {
      const height = ref.current.clientHeight + window.innerHeight - document.body.offsetHeight
      const zoomedIn = isZoomedIn()
      setHeight(zoomedIn ? 'auto' : height)
    }, 100)
  };


  useEffect(() => {
    window.addEventListener("resize", onResize);
    window.addEventListener("touchend", checkedZoomedIn);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("touchend", checkedZoomedIn);
    }
  }, [])

  useEffect(() => {
    onResize()
  }, [isFullscreen])


  // Outer div should not force width/height since that may prevent containers from shrinking.
  // Inner component should overflow and use calculated width/height.
  // See issue #68 for more information.
  return <div ref={ref} style={{ overflow: 'visible', width: '100%' }}>
    {children({ height })}
  </div>
}

export default AutoSizer
