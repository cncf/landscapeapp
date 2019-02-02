// locate zoom buttons
import { pure } from 'recompose';
import Share from 'react-twitter-widgets/dist/components/Share'
import settings from 'project/settings.yml'

import React from 'react';

const TweetButton = function() {
  return <div className="tweet-button">
    <Share url="https://github.com" options={{text: settings.twitter.text, url: settings.twitter.url}} />
    <span>{window.tweets}</span>
  </div>
}
export default pure(TweetButton);
