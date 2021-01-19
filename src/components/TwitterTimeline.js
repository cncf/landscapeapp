import { useRef, useEffect } from 'react'
import { Timeline } from 'react-twitter-widgets'
import useCurrentDevice from '../utils/useCurrentDevice'

const TwitterTimeline = ({ twitter }) => {
  const timelineRef = useRef(null)
  const name = twitter.split('/').pop()
  const currentDevice = useCurrentDevice()

  // This is a hack to fix overflow issues on Safari iPhone
  // see https://github.com/cncf/landscapeapp/issues/331
  useEffect(() => {
    if (currentDevice.ios() && navigator.vendor.match(/^apple/i)) {
      timelineRef.addEventListener("DOMSubtreeModified", (el) => {
        if (el.target.tagName === "IFRAME") {
          const head = el.target.contentDocument.head;
          const newStyle = el.target.contentDocument.createElement("style");
          const css = [
            ".TweetAuthor { max-width: 300px; text-overflow: ellipsis; }",
            ".timeline-Tweet-text a:not(.customisable) { word-break: break-all; }"
          ];
          newStyle.innerHTML = css.join(" ");
          head.appendChild(newStyle);
        }
      })
    }
  }, [])

  return <div ref={timelineRef}>
    <Timeline
      dataSource={{
        sourceType: 'profile',
        screenName: name
      }}
      options={{
        username: name,
        tweetLimit: 3
      }}
    />
  </div>
}

export default TwitterTimeline
