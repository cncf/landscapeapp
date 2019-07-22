// this file contains a code which can be used on both server and client side.
// client side uses this to get a list of items for a big picture
// server side uses this to build a sitemap, so we know which landscape a given
// element belongs to

export function sharedGetCategoriesForBigPicture({bigPictureSettings, format, landscape}) {
  const currentSettings = _.find(bigPictureSettings, {url: format});
  const categories = landscape.filter( (l) => l.level === 1).filter(function(category) {
    return _.find(currentSettings.elements, (element) => element.category === category.id);
  })
  return categories;
}

export function sharedGetCategoriesForServerlessBigPicture({landscape}) {
  const serverlessCategory = landscape.filter( (l) => l.label === 'Serverless')[0];
  return [serverlessCategory];
}

export function sharedGetCategoriesForCncfMembers({landscape}) {
  const membersCategory = landscape.filter( (l) => l.label === 'CNCF Members')[0];
  return [membersCategory];
}
