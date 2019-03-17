const phantom = require('phantom');

(async function() {
  let status = null;
  const instance = await phantom.create();
  const pageUrl = 'https://www.cloudflare.com/asdffdsa';
  const page = await instance.createPage();
  // await page.on('onResourceRequested', function(requestData) {
    // console.info('Requesting', requestData.url);
  // });
  await page.on('onNavigationRequested', function(url, type, willNavigate, main) {
    if (willNavigate && main) {
      console.log('Trying to navigate to: ' + url);
      console.log('Caused by: ' + type);
      console.log('Will actually navigate: ' + willNavigate);
      console.log('Sent from the page\'s main frame: ' + main);
    }
  });
  await page.on('onResourceReceived', function(response) {
    if (response.stage === 'end') {
      if (response.url === pageUrl + '/') {
        console.info('a / redirect, it is ok');
        // nothings special
      }
      if (response.url === pageUrl || response.url === pageUrl + '/') {
        if (response.code >= 400) {

        }

      }
      console.info(response.contentType, response.url, response.status);
      if (response.contentType === 'text/html') {
        console.info(response);
      }
    }
  });

  await page.open(pageUrl);
  console.info(status);
  //
  const content = await page.property('content');
  console.info('done');
  await instance.exit();
})();
