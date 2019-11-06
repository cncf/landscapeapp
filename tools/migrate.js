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

saveSettings(settings);
