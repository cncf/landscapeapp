import settings from '../utils/settings.js';

export const landscapeSettingsList = Object.values(settings.big_picture)
                                           .sort((a, b) => a.tab_index - b.tab_index);

const landscapeSettingsDict = landscapeSettingsList.reduce((dict, landscapeSettings) => {
  dict[landscapeSettings.url] = landscapeSettings;
  return dict;
}, {})

export const findLandscapeSettings = (url) => {
  return landscapeSettingsDict[url === 'card-mode' ? 'landscape' : url]
}
