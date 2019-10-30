import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { TwitterClient } from './apiClients';
import { projectPath, settings } from './settings';
import {dump} from './yaml';

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

async function main() {
  const source =  require('js-yaml').safeLoad(fs.readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
  const twitterOptions = source.twitter_options || { count: 0};
  // get a count from processed_landscape or use a base count
  const result = await getLatestTweets(twitterOptions.since_id);
  console.info(twitterOptions, result);
  // write this back to the processed_landscape.yml
  source.twitter_options = {
    count: result.count + twitterOptions.count,
    since_id: result.since_id
  };
  const newContent = "# THIS FILE IS GENERATED AUTOMATICALLY!\n" + dump(source);
  require('fs').writeFileSync(path.resolve(projectPath, 'processed_landscape.yml'), newContent);
}
main();
