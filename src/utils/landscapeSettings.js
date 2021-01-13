import settings from 'public/settings.json';


export const landscapeSettingsList = Object.values(settings.big_picture)
                                           .sort((a, b) => a.tab_index - b.tab_index)
                                           .map(({ url, ...rest }) => {
                                             const basePath = url === 'landscape' ? null : url
                                             const isMain = settings.big_picture.main.url === url
                                             return { url, basePath, isMain, ...rest }
                                           })

const landscapeSettingsDict = landscapeSettingsList.reduce((dict, landscapeSettings) => {
  dict[landscapeSettings.url] = landscapeSettings;
  return dict;
}, {})

export const findLandscapeSettings = (url) => {
  return landscapeSettingsDict[url === 'card-mode' ? 'landscape' : url]
}
