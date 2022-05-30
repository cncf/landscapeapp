module.exports.isParent = (urlOrSlug, project) => {
  if (urlOrSlug) {
    const url = urlOrSlug.indexOf("crunchbase.com") > 0 ? urlOrSlug : `https://www.crunchbase.com/organization/${urlOrSlug}`;

    return project.crunchbase === url || project.crunchbaseData.parents.includes(url);
  }
}
