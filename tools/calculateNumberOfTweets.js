import _ from 'lodash';
import { TwitterClient } from './apiClients';
import { settings } from './settings';
import { updateProcessedLandscape } from "./processedLandscape";

// we need to know a latest since_id, otherwise we can only expect
async function getLatestTweets(sinceId) {
  let count = 0;
  async function getTweets(maxId) {
    const params = {q: settings.twitter.search, count: 100, max_id: maxId, since_id: sinceId};
    const result = await TwitterClient.request({ path: 'search/tweets.json', params });
    const withoutLastId = result.statuses.filter( (x) => x.id_str !== maxId);
    count += withoutLastId.length;
    if (withoutLastId.length === 0) {
      return [];
    } else {
      return withoutLastId.concat(await getTweets(withoutLastId[withoutLastId.length - 1].id_str));
    }
  }
  const tweets = await getTweets();
  const normalTweets = tweets.filter( (x) => x.text.indexOf('RT ') !== 0);
  return {
    count: normalTweets.length,
    since_id: _.max(normalTweets.map((x) => x.id_str)) || sinceId
  }
}

updateProcessedLandscape(async processedLandscape => {
  const oldOptions = processedLandscape.twitter_options || { count: 0 }
  const result = await getLatestTweets(oldOptions.since_id);

  const twitter_options = {
    count: result.count + oldOptions.count,
    since_id: result.since_id
  };

  return { ...processedLandscape, twitter_options }
})
