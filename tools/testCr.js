import { CrunchbaseClient } from './apiClients';
import { CrunchbaseClientV4 } from './apiClients';

async function main() {
  const result = await CrunchbaseClient.request({ path: `/organizations/ibm` });
  const result2 = await CrunchbaseClientV4.request({ path: `entities/organizations/ibm`, params:{'card_ids': 'headquarters_address, acquisitions', 'field_ids': 'num_employees_enum,linkedin,twitter,name,website,description' }});
  console.info(result2);
}
main();
