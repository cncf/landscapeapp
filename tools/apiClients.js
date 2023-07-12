const { env } = require('process');
const { stringify, parse } = require('query-string');
const axios = require('axios');
const OAuth1 = require('oauth-1.0a');
const crypto = require('crypto');
const _ = require('lodash');

['GITHUB_KEY', 'TWITTER_KEYS'].forEach((key) => {
  if (!env[key]) {
    console.info(`${key} not provided`);
  }
});

let requests = {};

const maxAttempts = 5
const delay = 30000

const getOauth1Header = config => {
  const { method = 'GET', url = {}, params } = config
  const data = parse(stringify(params))
  const request = { method, url, data }
  const { consumer_key, consumer_secret, access_token_key, access_token_secret } = config.oauth

  const oauth = OAuth1({
    consumer: {
      key: consumer_key,
      secret: consumer_secret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64')
    },
  })

  const authorization = oauth.authorize(request, {
    key: access_token_key,
    secret: access_token_secret,
  });

  return oauth.toHeader(authorization);
}

const requestWithRetry = async ({ attempts = maxAttempts, resolveWithFullResponse, retryStatuses, delayFn, applyKey, keys, ...rest }) => {
  if (!applyKey) {
    keys = [true];
    applyKey = () => true;
  }

  let lastEx = null;
  for (var key of keys) {
    applyKey(rest, key);
    try {
      axios.interceptors.request.use(function (config) {
        const authHeader = config.oauth ? getOauth1Header(config) : {}
        return { ...config, headers: { ...config.headers, ...authHeader } }
      })

      const response = await axios(rest);
      return resolveWithFullResponse ? response : response.data
    } catch (ex) {

      const { response = {}, ...error } = ex
      const { status } = response

      const isGithubIssue = (response?.data?.message || '').indexOf('is too large to list') !== -1;

      const message = [
        `Attempt #${maxAttempts - attempts + 1}`,
        `(Status Code: ${status || error.code})`,
        `(URI: ${rest.url})`
      ].join(' ')
      if (key === keys[keys.length - 1]) {
        console.info(message);
      } else {
        console.info(`Failed to use key #${keys.indexOf(key)} of ${keys.length}`);
      }
      const rateLimited = retryStatuses.includes(status)
      const dnsError = error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo'
      if (attempts <= 0 || (!rateLimited && !dnsError) || isGithubIssue) {
        throw ex;
      }
      lastEx = ex;
    }
  }
  await new Promise(r => setTimeout(r, delayFn ? delayFn(lastEx) : delay))
  return await requestWithRetry({ attempts: attempts - 1, retryStatuses, delayFn, ...rest });
}

// We only want to retry a request when rate limited. By default the status code is 429.
const ApiClient = ({ baseURL, applyKey, keys, defaultOptions = {}, defaultParams = {}, retryStatuses = [429], delayFn = null }) => {
  return {
    request: async ({ path = null, url = null, method = 'GET', params = {}, resolveWithFullResponse = false, ...rest }) => {
      const queryParams = { ...defaultParams, ...params };

      if (path) {
        url = `${baseURL}${path[0] === '/' ? '' : '/' }${path}`;
      }

      const key = `${method} ${url}?${stringify(queryParams)}`;

      if (!requests[key]) {
        requests[key] = requestWithRetry({
          applyKey: applyKey,
          keys: keys,
          method: method,
          url: url,
          params: queryParams,
          ...defaultOptions,
          ...rest,
          retryStatuses,
          delayFn,
          resolveWithFullResponse
        })
      }

      return await requests[key];
    }
  }
};

module.exports.CrunchbaseClient = ApiClient({
  baseURL: 'https://api.crunchbase.com/api/v4',
  defaultParams: { user_key: env.CRUNCHBASE_KEY_4 },
  defaultOptions: { followRedirect: true, maxRedirects: 5, timeout: 10 * 1000 }
});

module.exports.GithubClient = ApiClient({
  baseURL: 'https://api.github.com',
  retryStatuses: [401, 403], // Github returns 403 when rate limiting.
  delayFn: error => {
    const rateLimitRemaining = parseInt(_.get(error, ['response', 'headers', 'x-ratelimit-remaining'], 1))
    const rateLimitReset = parseInt(_.get(error, ['response', 'headers', 'x-ratelimit-reset'], 1)) * 1000
    if (rateLimitRemaining > 0) {
      return 30000
    } else {
      const delay = Math.max(Math.ceil((new Date(rateLimitReset)) - (new Date())), 60000)
      console.log(`Hourly rate limit exceeded on Github, delaying for ${Math.round(delay / 1000 / 60)} minutes`)
      return delay
    }
  },
  defaultOptions: {
    followRedirect: true,
    timeout: 10 * 1000,
    headers: {
      'User-agent': 'CNCF'
    },
  },
  keys: (env.GITHUB_KEY || '').split(',').map( (x) => x.trim()),
  applyKey: (options, key) => options.headers.Authorization = `token ${key}`
});

const [consumerKey, consumerSecret, accessTokenKey, accessTokenSecret] = (env.TWITTER_KEYS || '').split(',');

module.exports.TwitterClient = ApiClient({
  baseURL: 'https://api.twitter.com/1.1',
  defaultOptions: {
    oauth: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessTokenKey,
      access_token_secret: accessTokenSecret
    }
  }
});

module.exports.YahooFinanceClient = ApiClient({
  baseURL: 'https://query2.finance.yahoo.com',
});
