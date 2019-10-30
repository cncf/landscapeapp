const [consumerKey, consumerSecret, accessTokenKey, accessTokenSecret] = (process.env['TWITTER_KEYS'] || '').split(',');
import rp from './rpRetry';

const oauth = {
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  access_token_key: accessTokenKey,
  access_token_secret: accessTokenSecret
};

const client = ({ path, method = 'GET', params = {} }) => {
  const options = {
    method: method,
    qs: params,
    oauth: oauth,
    url: `https://api.twitter.com/1.1${path}.json`,
    json: true
  }

  return rp(options)
}

export default client;
