import settings from 'project/settings.yml';

export default (targetUrl) => {
  return Object.values(settings.big_picture).find(({ url }) => url === targetUrl)
}
