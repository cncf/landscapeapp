import { env } from 'process';
import { stringify } from 'query-string';
import requestPromise from 'request-promise';
import _ from 'lodash'
import Promise from "bluebird";

['CRUNCHBASE_KEY_4', 'GITHUB_KEY', 'TWITTER_KEYS'].forEach((key) => {
  if (!env[key]) {
    console.info(`${key} not provided`);
  }
});

let requests = {};

const maxAttempts = 5
const delay = 30000

const requestWithRetry = async ({ attempts = maxAttempts, retryStatuses, delayFn, ...rest }) => {
  try {
    return await requestPromise(rest);
  } catch (ex) {
    const { statusCode, options, error } = ex;
    const message = [
      `Attempt #${maxAttempts - attempts + 1}`,
      `(Status Code: ${statusCode})`,
      `(URI: ${options.uri.split('?')[0]})`
    ].join(' ')
    console.info(message);
    const rateLimited = retryStatuses.includes(statusCode)
    const dnsError = error && error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo'
    if (attempts <= 0 || (!rateLimited && !dnsError)) {
      throw ex;
    }
    await Promise.delay(delayFn ? delayFn(ex) : delay);
    return await requestWithRetry({ attempts: attempts - 1, retryStatuses, delayFn, ...rest });
  }
}

// We only want to retry a request when rate limited. By default the status code is 429.
const ApiClient = ({ baseUrl, defaultOptions = {}, defaultParams = {}, retryStatuses = [429], delayFn = null }) => {
  return {
    request: async ({ path = null, url = null, method = 'GET', params = {}, ...rest }) => {
      const qs = { ...defaultParams, ...params };

      if (path) {
        url = `${baseUrl}${path[0] === '/' ? '' : '/' }${path}`;
      }

      const key = `${method} ${url}?${stringify(qs)}`;

      if (!requests[key]) {
        requests[key] = requestWithRetry({
          method: method,
          uri: url,
          json: true,
          ...defaultOptions,
          ...rest,
          qs,
          retryStatuses,
          delayFn
        })
      }

      return await requests[key];
    }
  }
};

export const CrunchbaseClient = ApiClient({
  baseUrl: 'https://api.crunchbase.com/api/v4',
  defaultParams: { user_key: env.CRUNCHBASE_KEY_4 },
  defaultOptions: { followRedirect: true, maxRedirects: 5, timeout: 10 * 1000 }
});

export const GithubClient = ApiClient({
  baseUrl: 'https://api.github.com',
  retryStatuses: [403], // Github returns 403 when rate limiting.
  delayFn: error => {
    const rateLimitRemaining = parseInt(_.get(error, ['response', 'headers', 'x-ratelimit-remaining'], 1))
    const rateLimitReset = parseInt(_.get(error, ['response', 'headers', 'x-ratelimit-reset'], 1)) * 1000
    if (rateLimitRemaining > 0) {
      return 30000
    } else {
      const delay = Math.ceil((new Date(rateLimitReset)) - (new Date()))
      console.log(`Hourly rate limit exceeded on Github, delaying for ${Math.round(delay / 1000 / 60)} minutes`)
      return delay
    }
  },
  defaultOptions: {
    followRedirect: true,
    timeout: 10 * 1000,
    headers: {
      'User-agent': 'CNCF',
      'Authorization': `token ${env.GITHUB_KEY}`
    },
  }
});

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

export const YahooFinanceClient = ApiClient({
  baseUrl: 'https://query2.finance.yahoo.com',
});
