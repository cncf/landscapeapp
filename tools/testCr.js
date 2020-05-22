import { CrunchbaseClientV3 } from './apiClients';
import { CrunchbaseClientV4 } from './apiClients';
import { fetchDataV3, fetchDataV4 } from './crunchbase';

async function main() {
  const result = await CrunchbaseClient.request({ path: `/organizations/ibm` });
  const result2 = await CrunchbaseClientV4.request({ path: `entities/organizations/ibm`, params:{'card_ids': 'headquarters_address,acquiree_acquisitions', 'field_ids': 'num_employees_enum,linkedin,twitter,name,website,description' }});
  console.info(result2);
  console.info(JSON.stringify(result2.cards.headquarters_address[0], null, 2));
  for (var a of result2.cards.acquiree_acquisitions) {
    console.info(a.announced_on.value, a.acquiree_identifier.value, (a.price  || {}).value_usd) ;
  }
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
main2();
