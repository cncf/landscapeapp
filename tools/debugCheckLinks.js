import rp from 'request-promise';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import  { checkUrl } from './checkLinks';
const urls = [
  "https://www.habitat.sh/",
  "https://tig.jd.com/en/products/jdos",
  "https://www.tingyun.com/tingyun_app.html",
  "https://www.adfolks.com/"
];

async function main(url) {
  const result = await checkUrl(url);
  console.info(url, result);
}

urls.forEach(function(url) { main(url) });

