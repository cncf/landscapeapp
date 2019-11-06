import { settings, saveSettings } from './settings';

const endUserMembership = settings.membership['End User Supporter'];
if (endUserMembership) {
  endUserMembership.enduser = true;
}

const extraLandscape = settings.big_picture.extra;
if (extraLandscape) {
  extraLandscape.category = "Serverless";
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

saveSettings(settings);
