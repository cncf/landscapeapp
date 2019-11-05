import { settings, saveSettings } from './settings';

const endUserMembership = settings.membership['End User Supporter'];

if (endUserMembership) {
  endUserMembership.enduser = true
  saveSettings(settings);
}
