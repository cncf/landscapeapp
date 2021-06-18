//TODO: if we have a non default branch just exit

import { settings } from './settings';
if (!settings.global.skip_funding) {
  require('./fundingHistoryData');
  require('./fundingHistoryPage');
}
