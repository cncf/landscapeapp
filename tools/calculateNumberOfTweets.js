import client from './twitterClient';

// we need to know a latest since_id, otherwise we can only expect
const baseCount = {
  count: 444,
  since_id: '1091279509075021824'
}

async function main() {
  let count = 0;
  async function getTweets(maxId) {
    console.info(count);
    const result = await client.get('search/tweets', {q: 'landscape.cncf.io', count: 20, max_id: maxId});
    const withoutLastId = result.statuses.filter( (x) => x.id_str !== maxId);
    count += withoutLastId.length;
    if (withoutLastId.length === 0) {
      return [];
    } else {
      return withoutLastId.concat(await getTweets(withoutLastId[withoutLastId.length - 1].id_str));
    }
  }
  const tweets = await getTweets();
  console.info(tweets.length, tweets.map ((x) => x.text));
}
