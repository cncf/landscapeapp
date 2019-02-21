// locate zoom buttons
import { connect } from 'react-redux';
import { withState, pure } from 'recompose';
import settings from 'project/settings.yml'
import qs from 'query-string';

import React from 'react';

const bird = ( <svg
  viewBox="0 0 300 244">
  <g transform="translate(-539.17946,-568.85777)" >
    <path fill-opacity="1" fill-rule="nonzero"
       d="m 633.89823,812.04479 c 112.46038,0 173.95627,-93.16765 173.95627,-173.95625 0,-2.64628 -0.0539,-5.28062 -0.1726,-7.90305 11.93799,-8.63016 22.31446,-19.39999 30.49762,-31.65984 -10.95459,4.86937 -22.74358,8.14741 -35.11071,9.62551 12.62341,-7.56929 22.31446,-19.54304 26.88583,-33.81739 -11.81284,7.00307 -24.89517,12.09297 -38.82383,14.84055 -11.15723,-11.88436 -27.04079,-19.31655 -44.62892,-19.31655 -33.76374,0 -61.14426,27.38052 -61.14426,61.13233 0,4.79784 0.5364,9.46458 1.58538,13.94057 -50.81546,-2.55686 -95.87353,-26.88582 -126.02546,-63.87991 -5.25082,9.03545 -8.27852,19.53111 -8.27852,30.73006 0,21.21186 10.79366,39.93837 27.20766,50.89296 -10.03077,-0.30992 -19.45363,-3.06348 -27.69044,-7.64676 -0.009,0.25652 -0.009,0.50661 -0.009,0.78077 0,29.60957 21.07478,54.3319 49.0513,59.93435 -5.13757,1.40062 -10.54335,2.15158 -16.12196,2.15158 -3.93364,0 -7.76596,-0.38716 -11.49099,-1.1026 7.78383,24.2932 30.35457,41.97073 57.11525,42.46543 -20.92578,16.40207 -47.28712,26.17062 -75.93712,26.17062 -4.92898,0 -9.79834,-0.28036 -14.58427,-0.84634 27.05868,17.34379 59.18936,27.46396 93.72193,27.46396" />
  </g>
</svg>);

const TweetButton = function({url, cls}) {
  const countBorder = (<svg>
    <path d="M3 1 L3 9 L 1 12 L 3 15 L 3 19 L 34 19 L 34 1 Z" />
  </svg>);
  const params = qs.stringify({
    text: settings.twitter.text,
    url: url
  });
  const twitterUrl = `https://twitter.com/intent/tweet?${params}`;
  return <div className={`tweet-button ${cls}`}>
    <a href={twitterUrl}>{bird}<span>Tweet</span></a>
    <div className="tweet-count"><span>{window.tweets}</span>{countBorder}</div>
  </div>
}

const mapStateToProps = (state) => ({
  url: window.location.origin + state.router.location.pathname
});
const mapDispatchToProps = {};

const TweetButtonContainer = connect(mapStateToProps, mapDispatchToProps)(TweetButton);
export default TweetButtonContainer;
