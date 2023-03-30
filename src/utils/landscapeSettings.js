const { readJsonFromDist } = require('./readJson');
const settings = readJsonFromDist('settings');

function calcLandscapeSettingsList(settingsObj) {
  return Object.values(settingsObj.big_picture)
    .sort((a, b) => a.tab_index - b.tab_index)
    .map(({ url, ...rest }) => {
      const basePath = url === 'landscape' ? null : url
      const isMain = !rest.category;
      return { url, basePath, isMain, ...rest }
    })

}

// client side version
const landscapeSettingsList = module.exports.landscapeSettingsList = calcLandscapeSettingsList(settings);
const landscapeSettingsDict = landscapeSettingsList.reduce((dict, landscapeSettings) => {
  dict[landscapeSettings.url] = landscapeSettings;
  return dict;
}, {});

module.exports.findLandscapeSettings = (url) => {
  if (url === 'main') {
    url = 'landscape';
  }
  return landscapeSettingsDict[['card-mode', 'guide'].includes(url) ? 'landscape' : url]
}

// server side version, with up to date information
module.exports.getLandscapeSettingsList = function(settingsObj) {
  return calcLandscapeSettingsList(settingsObj);
}
