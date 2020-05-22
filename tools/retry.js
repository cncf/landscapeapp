import Promise from 'bluebird';
const maxAttempts = 5;
const retry  = async function (fn, attempts = maxAttempts, delay = 50000, retryStatuses = [], delayFn = null) {
  try {
    const result = await fn();
    return result;
  } catch (ex) {
    const { statusCode, options, error } = ex;
    const message = [
      `Attempt #${maxAttempts - attempts + 1}`,
      statusCode ? `(Status Code: ${statusCode})` : null,
      options && options.uri ? `(URI: ${options.uri.split('?')[0]})` : `(MESSAGE: ${ex.message})`
    ].filter(_ => _).join(' ')
    console.info(message);
    const rateLimitted = retryStatuses.includes(statusCode)
    const dnsError = error && error.code === 'ENOTFOUND' && error.syscall === 'getaddrinfo'
    if (attempts <= 0 || (!rateLimitted && !dnsError)) {
      throw ex;
    }
    await Promise.delay(delayFn ? delayFn(ex) : delay);
    return await retry(fn, attempts - 1, delay, retryStatuses, delayFn);
  }
}
export default retry;
