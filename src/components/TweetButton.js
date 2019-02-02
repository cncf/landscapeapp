// locate zoom buttons
import { withState, pure } from 'recompose';
import Share from 'react-twitter-widgets/dist/components/Share'
import settings from 'project/settings.yml'

import React from 'react';

const wrapper = withState('isReady', 'setIsReady', false);
const TweetButton = function({isReady, setIsReady}) {
  return <div className="tweet-button">
    <Share url={settings.twitter.url} options={{text: settings.twitter.text}} onLoad={() => setTimeout( () => setIsReady(true), 100)} />
    { isReady && <div className="tweet-count"><span>{window.tweets}</span></div> }
  </div>
}
export default pure(wrapper(TweetButton));
