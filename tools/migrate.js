import { settings, saveSettings } from './settings';
import { landscape, saveLandscape } from './landscape';
import traverse from 'traverse';

const endUserMembership = settings.membership['End User Supporter'];
if (endUserMembership) {
  endUserMembership.enduser = true;
}

const extraLandscape = settings.big_picture.extra;
if (extraLandscape) {
  extraLandscape.category = "Serverless";

  const index = extraLandscape.elements.findIndex(({ category }) => category === "Platform");

  if (index > -1) {
    const platformCategory = extraLandscape.elements[index];
    platformCategory.category = "Hosted Platform";

    const width = (platformCategory.width - 20) / 2;
    platformCategory.width = width;

    const newCategory = { ...platformCategory, category: "Installable Platform", left: width + 20 };
    extraLandscape.elements.splice(index + 1, 0, newCategory);
  }
}

const thirdLandscape = settings.big_picture.third;
if (thirdLandscape) {
  thirdLandscape.category = "CNCF Members";
}

for (let key in settings.big_picture) {
  delete settings.big_picture[key].method;
}

const relations = settings.relation.values;
const hostedRelation = relations.find(({id}) => id === "hosted");
if (hostedRelation) {
  let sandboxRelation = (hostedRelation.children || []).find(({id}) => id === "sandbox");
  if (sandboxRelation) {
    sandboxRelation.additional_relation = "member"
  }
}

if (settings.global.flags) {
  delete settings.global.flags.cncf_sandbox;
}

traverse(landscape).forEach((node) => {
  if (node && node.crunchbase && node.crunchbase === 'https://www.cncf.io') {
    delete node.crunchbase;
    node.unnamed_organization = true;
    settings.anonymous_organization = {
      name: 'Non-Public Unnamed Organization',
      homepage: 'https://www.cncf.io',
      city: 'Bouvet Island',
      region: 'Antarctica',
      country: 'Antarctica',
      twitter: 'https://twitter.com/CloudNativeFdn',
    }
  }
});

traverse(settings).forEach((node) => {
  if (node && node.type && ["OtherLandscapeLink", "ThirdLandscapeLink"].includes(node.type)) {
    node.type = "LandscapeLink";
  }
});

saveSettings(settings);
saveLandscape(landscape);
