process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import  { checkUrl } from './checkLinks';
const urls = [
  "https://kubernetes.io",
  "https://cloud.baidu.com",
  "https://dubbo.apache.org/en-us",
];

async function main() {
  for (var url of urls) {
    const result = await checkUrl(url);
    console.info(result);
  }
  process.exit(1);
}
main();


