import React from "react";
import Timeline from 'react-twitter-widgets/dist/components/Timeline.js';
import currentDevice from 'current-device';

class TwitterTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.timelineRef = null;
  }

  componentDidMount () {
    // This is a hack to fix overflow issues on Safari iPhone
    // see https://github.com/cncf/landscapeapp/issues/331
    if (currentDevice.ios() && navigator.vendor.match(/^apple/i)) {
      this.timelineRef.addEventListener("DOMSubtreeModified", (el) => {
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
  }

  render() {
    const name =  this.props.twitter.split('/').pop();

    return <div ref={el => this.timelineRef = el}>
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
}

export default TwitterTimeline;
