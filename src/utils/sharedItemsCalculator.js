// this file contains a code which can be used on both server and client side.
// client side uses this to get a list of items for a big picture
// server side uses this to build a sitemap, so we know which landscape a given
// element belongs to

import _ from 'lodash';

export const getLandscapeCategories = ({ landscape, landscapeSettings }) => {
  if (landscapeSettings.url === "landscape") {
    return landscape.filter( ({ level }) => level === 1).filter((category) => {
      return _.find(landscapeSettings.elements, (element) => element.category === category.id);
    })
  } else {
    return landscape.filter(({ label }) => label === landscapeSettings.category)
  }
}
