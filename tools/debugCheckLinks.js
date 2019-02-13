import rp from 'request-promise';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import  { checkUrl } from './checkLinks';
const urls = [
"https://github.com/uber/pyro",
"https://cloud.vmware.com/pivotal-container-service"
];

async function main(url) {
  const result = await checkUrl(url);
  console.info(url, result);
}

urls.forEach(function(url) { main(url) });

