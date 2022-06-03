//TODO: if we have a non default branch just exit

const { settings } = require('./settings');

if (!settings.global.skip_funding) {
  require('./fundingHistoryData');
  require('./fundingHistoryPage');
}
