import Promise from 'bluebird';
import { env } from 'process';
import { stringify } from 'query-string';
import rp from './rpRetry';

['CRUNCHBASE_KEY', 'GITHUB_KEY', 'TWITTER_KEYS'].forEach((key) => {
  if (!env[key]) {
    console.info(`${key} not provided`);
  }
});

let requests = {};

// We only want to retry a request when rate limited. By default the status code is 429.
const ApiClient = ({ baseUrl, defaultOptions = {}, defaultParams = {}, retryStatuses = [429] }) => {
  return {
    request: async ({ path = null, url = null, method = 'GET', params = {} }) => {
      const qs = { ...defaultParams, ...params };

      if (path) {
        url = `${baseUrl}${path[0] === '/' ? '' : '/' }${path}`;
      }

      const key = `${method} ${url}?${stringify(qs)}`;

      if (!requests[key]) {
        requests[key] = rp({
          method: method,
          uri: url,
          json: true,
          ...defaultOptions,
          qs,
          retryStatuses
        })
      }

      return await requests[key];
    }
  }
};

export const CrunchbaseClient = ApiClient({
  baseUrl: 'https://api.crunchbase.com/v3.1',
  defaultParams: { user_key: env.CRUNCHBASE_KEY },
  defaultOptions: { followRedirect: true, maxRedirects: 5, timeout: 10 * 1000 }
});

const OldGithubClient = ApiClient({
  baseUrl: 'https://api.github.com',
  retryStatuses: [403], // Github returns 403 when rate limiting.
  defaultOptions: {
    followRedirect: true,
    timeout: 10 * 1000,
    headers: {
      'User-agent': 'CNCF',
      'Authorization': `token ${env.GITHUB_KEY}`
    },
  }
});

export const GithubClient = {
  request: async function({ path = null, url = null, method = 'GET', params = {} }) {
    const rates = await rp({
      uri: 'https://api.github.com/rate_limit',
      json: true,
      headers: {
        'User-agent': 'CNCF',
        'Authorization': `token ${env.GITHUB_KEY}`
      }});
    const remaining = rates.resources.core.remaining;
    if (remaining < 100) { // because requests may go in parallel
      console.info('Pausing for one hour, github quote exceeded');
      await Promise.delay(3600 * 1000);
    }
    return await OldGithubClient.request({path, url, method, params});
  }
};

const [consumerKey, consumerSecret, accessTokenKey, accessTokenSecret] = (env.TWITTER_KEYS || '').split(',');

export const TwitterClient = ApiClient({
  baseUrl: 'https://api.twitter.com/1.1',
  defaultOptions: {
    oauth: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessTokenKey,
      access_token_secret: accessTokenSecret
    }
  }
});
