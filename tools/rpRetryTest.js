const { requestWithRetry } = require('./requestWithRetry');
async function main() {
  const result = await requestWithRetry({
    url: 'http://google.com',
    verbose: true,
    timeout: 30000
  });
  console.info(result);
}
main();
