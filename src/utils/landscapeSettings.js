import path from 'path';
import fs from 'fs';
import settings from 'dist/settings';

function calcLandscapeSettingsList(settingsObj) {
  return Object.values(settingsObj.big_picture)
    .sort((a, b) => a.tab_index - b.tab_index)
    .map(({ url, ...rest }) => {
      const basePath = url === 'landscape' ? null : url
      const isMain = settingsObj.big_picture.main.url === url
      return { url, basePath, isMain, ...rest }
    })

};

// client side version
export const landscapeSettingsList = calcLandscapeSettingsList(settings);
const landscapeSettingsDict = landscapeSettingsList.reduce((dict, landscapeSettings) => {
  dict[landscapeSettings.url] = landscapeSettings;
  return dict;
}, {})

export const findLandscapeSettings = (url) => {
  if (url === 'main') {
    url = 'landscape';
  }
  return landscapeSettingsDict[['card-mode', 'guide'].includes(url) ? 'landscape' : url]
}

// server side version, with up to date information
export function getLandscapeSettingsList(settingsObj) {
  return calcLandscapeSettingsList(settingsObj);
}
