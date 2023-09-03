const twitter = "https://twitter.com/vitessio";
async function main() {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'], headless: false});
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120 * 1000);

  try {
    await page.goto(twitter);
    await page.waitForTimeout(5000);
    const data = await page.evaluate(`Array.from(document.querySelectorAll('time[datetime]')).map( (x) => x.dateTime)`)
    console.info(data);


  } catch(ex) {
    console.info(ex);
  }

}
main();
