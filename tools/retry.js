const Promise = require('bluebird');
const maxAttempts = 5;
const retry  = async function (fn, attempts = maxAttempts, delay = 50000) {
  try {
    return await fn();
  } catch (ex) {
    console.info(`Attempt #${maxAttempts - attempts + 1} (MESSAGE: ${ex.message})`);
    if (attempts <= 0) {
      throw ex;
    }
    await Promise.delay(delay);
    return await retry(fn, attempts - 1, delay);
  }
}
module.exports.retry = retry;
