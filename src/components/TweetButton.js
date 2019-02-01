// locate zoom buttons
import { pure } from 'recompose';
import Share from 'react-twitter-widgets/dist/components/Share'

import React from 'react';

const TweetButton = function() {
  return <div className="tweet-button">
    <Share url="https://github.com" options={{text: "Let everyone know how great is this website"}} />
  </div>
}
export default pure(TweetButton);
