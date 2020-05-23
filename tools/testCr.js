import { CrunchbaseClientV3 } from './apiClients';
import { CrunchbaseClientV4 } from './apiClients';
import { fetchDataV3, fetchDataV4 } from './crunchbase';

async function main() {
  const oldData = await fetchDataV3('zeit');
  console.info('got old');
  const newData = await fetchDataV4('zeit');
  console.info('got new');
  console.info(newData);
  console.info(oldData);
}

async function main2() {
  const newData = await fetchDataV3('oracle');
  const oldData = await fetchDataV4('oracle');
  console.info(newData.acquisitions.length, oldData.acquisitions.length);
  console.info(newData.acquisitions[180], oldData.acquisitions[180]);
  console.info(JSON.stringify(newData.acquisitions) === JSON.stringify(oldData.acquisitions));
  for (var i = 0; i < newData.acquisitions.length; i++) {
    const bad = (JSON.stringify(newData.acquisitions[i]) !== JSON.stringify(oldData.acquisitions[i]));
    if (bad) {
      console.info(i);
      console.info(newData.acquisitions[i].date === oldData.acquisitions[i].date, newData.acquisitions[i].acquiree === oldData.acquisitions[i].acquiree);
    }
  }
  delete newData.acquisitions;
  delete oldData.acquisitions;
  console.info(newData, oldData);


}
main();
