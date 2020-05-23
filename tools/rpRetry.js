import retry from './retry';
import rp from 'request-promise';

const rpWithRetry = async function(args) {
  const { retryStatuses, delayFn, ...rest } = args
  return await retry(() => rp(rest), 5, 30000, retryStatuses, delayFn);
}
export default rpWithRetry;
