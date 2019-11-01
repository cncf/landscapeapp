import Promise from 'bluebird';
const maxAttempts = 5;
const retry  = async function (fn, attempts = maxAttempts, delay = 50000, retryStatuses = null) {
  try {
    const result = await fn();
    return result;
  } catch (ex) {
    const { statusCode } = ex;
    console.info(`Attempt #${maxAttempts - attempts + 1}${statusCode ? ` (Status Code: ${statusCode})` : ''}`);
    if (attempts <= 0 || (retryStatuses && !retryStatuses.includes(statusCode))) {
      throw ex;
    }
    await Promise.delay(delay);
    return await retry(fn, attempts - 1);
  }
}
export default retry;
