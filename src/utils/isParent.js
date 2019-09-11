export default (crunchbaseSlug, project) => {
  const crunchbaseUrl = `https://www.crunchbase.com/organization/${crunchbaseSlug}`;

  return project.crunchbase === crunchbaseUrl || project.crunchbaseData.parents.includes(crunchbaseUrl);
}
