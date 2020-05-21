import { CrunchbaseClient } from './apiClients';
import { CrunchbaseClientV4 } from './apiClients';
import { fetchNewData, fetchOldData } from './crunchbase';

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
  const newData = await fetchNewData('ibm');
  const oldData = await fetchOldData('ibm');
  console.info(newData.acquisitions.length, oldData.acquisitions.length);


}
main2();
