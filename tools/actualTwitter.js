module.exports.actualTwitter = function actualTwitter(node, crunchbaseEntry) {
  const twitterUrl = 'twitter' in node ? node.twitter : (crunchbaseEntry || {}).twitter;

  if (twitterUrl) {
    return twitterUrl.replace(/^http(?:s)?\:\/\/(?:www\.)?/, 'https://')
                     .replace(/\?.*/, '');
  }
}
