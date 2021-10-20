import retry from './retry';
import axios from 'axios'

const requestWithRetry = async function(args) {
  const { retryStatuses, delayFn, ...rest } = args
  const request = async config => {
    const response = await axios(config)
    return response.data
  }
  return await retry(() => request(rest), 5, 30000, retryStatuses, delayFn);
}
export default requestWithRetry;
