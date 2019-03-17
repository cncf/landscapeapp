import Promise from 'bluebird'
const phantom = require('phantom');

(async function() {
  let status = null;
  const no = () => null;
  const instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no'], {logger: {info: no, warning: no, error: no, debug: no}});
  // const pageUrl = 'https://www.cloudflare.com';
  // const pageUrl = 'https://www.tingyun.com/tingyun_app.html';
  const pageUrl = 'https://www.habitat.sh/';
  const page = await instance.createPage();
  // await page.on('onResourceRequested', function(requestData) {
    // console.info('Requesting', requestData.url);
  // });
  await page.on('onResourceReceived', function(response) {
    if (response.stage === 'end') {
      if (response.url === pageUrl + '/') {
        // nothings special
      }
      if (response.url === pageUrl || response.url === pageUrl + '/') {
          status = response.status;
      }
    }
  });

  await page.open(pageUrl);
  await Promise.delay(5 * 1000);
  const newUrl = await page.evaluate(function() {
    return document.location.href
  });
  const withoutTrailingSlash = (x) => x.replace(/#(.*)/, '').replace(/\/$/, '');
  console.info('Status: ', status, 'New url: ', newUrl);
  if (withoutTrailingSlash(newUrl) !== withoutTrailingSlash(pageUrl)) {
    console.info('redirect', withoutTrailingSlash(newUrl));
  } else if (status >= 400) {
    console.info('not found');
  } else if (status === null) {
    console.info('navigation error or timeout');
  }
  await instance.exit();
})();
