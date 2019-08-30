export default function actualTwitter(node, crunchbaseEntry) {
  const twitterUrl = node.twitter || (crunchbaseEntry || {}).twitter;

  if (twitterUrl) {
    return twitterUrl.replace(/^http(?:s)?\:\/\/(?:www\.)?/, 'https://')
                     .replace(/\?.*/, '');
  }
}
