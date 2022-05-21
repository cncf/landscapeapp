const path = require('path');
const fs = require('fs');

const { readJsonFromDist } = require('./readJson');
const settings = readJsonFromDist('settings');

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
const landscapeSettingsList = calcLandscapeSettingsList(settings);
const landscapeSettingsDict = landscapeSettingsList.reduce((dict, landscapeSettings) => {
  dict[landscapeSettings.url] = landscapeSettings;
  return dict;
}, {});
module.exports.landscapeSettingsList = landscapeSettingsList;

const findLandscapeSettings = (url) => {
  if (url === 'main') {
    url = 'landscape';
  }
  return landscapeSettingsDict[['card-mode', 'guide'].includes(url) ? 'landscape' : url]
}
module.exports.findLandscapeSettings = findLandscapeSettings;

// server side version, with up to date information
function getLandscapeSettingsList(settingsObj) {
  return calcLandscapeSettingsList(settingsObj);
}
module.exports.getLandscapeSettingsList = getLandscapeSettingsList;
