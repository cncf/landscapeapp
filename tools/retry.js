import Promise from 'bluebird';
const maxAttempts = 5;
const retry  = async function (fn, attempts = maxAttempts, delay = 50000, retryStatuses = null) {
  try {
    const result = await fn();
    return result;
  } catch (ex) {
    const { statusCode, options } = ex;
    const message = [
      `Attempt #${maxAttempts - attempts + 1}`,
      statusCode ? `(Status Code: ${statusCode})` : null,
      options && options.uri ? `(URI: ${options.uri.split('?')[0]})` : `(MESSAGE: ${ex.message})`
    ].filter(_ => _).join(' ')
    console.info(message);
    if (attempts <= 0 || (retryStatuses && !retryStatuses.includes(statusCode))) {
      throw ex;
    }
    await Promise.delay(delay);
    return await retry(fn, attempts - 1);
  }
}
export default retry;
