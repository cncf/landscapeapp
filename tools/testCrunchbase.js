const { fetchData } = require('./crunchbase');

async function main() {
  const data = await fetchData('docker');
  console.info(data);
}
main();
