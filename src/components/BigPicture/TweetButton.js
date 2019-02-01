// locate zoom buttons
import { pure } from 'recompose';
import Share from 'react-twitter-widgets/dist/components/Share'

import React from 'react';

const TweetButton = function() {
  return <div className="tweet-button">
    <Share url="https://github.com" />
  </div>
}
export default pure(TweetButton);
