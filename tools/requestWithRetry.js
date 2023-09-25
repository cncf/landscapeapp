const axios = require('axios');
const { retry } = require('./retry');

const requestWithRetry = async function(args) {
  const { retryStatuses, delayFn, ...rest } = args
  const request = async config => {
    const response = await axios(config)
    return response.data
  }
  return await retry(() => request(rest), 3, 30000, retryStatuses, delayFn);
}
module.exports.requestWithRetry = requestWithRetry;
