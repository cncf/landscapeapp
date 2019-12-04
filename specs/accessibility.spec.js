import puppeteer from "puppeteer";
const { AxePuppeteer } = require('axe-puppeteer');

const appUrl = `http://localhost:${(process.env.PORT || '4000')}`;

const analyzePage = async (url) => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], defaultViewport: { width: 1600, height: 1200 }});
  const page = await browser.newPage();
  await page.goto(appUrl);
  await page.waitForSelector('.cards-section')
  const results = await new AxePuppeteer(page).withTags('wcag2a').analyze()
  await browser.close()

  if (results.violations.length > 0) {
    throw(`Page has accessibility issues!: \n\n${JSON.stringify(results.violations, null, 4)}`)
  }
}

describe("Accessibility", () => {
  test("Main Landscape", async () => {
    await analyzePage(appUrl)
  }, 60 * 1000);

  test("Card Mode", async () => {
    await analyzePage(`${appUrl}/format=card-mode`)
  }, 60 * 1000);
});
