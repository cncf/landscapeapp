import puppeteer from "puppeteer";
import devices from 'puppeteer/DeviceDescriptors';
import { settings } from '../tools/settings'
const port = process.env.PORT || '4000';
const appUrl = `http://localhost:${port}`;
const width = 1920;
const height = 1080;
let page;
let browser;

if (process.env.SHOW_BROWSER) {
  jest.setTimeout(30000);
}
function mainTest() {
  describe("Main test", () => {
    test("I visit a main page and have all required elements", async () => {
      console.info('about to open a page');
      await page.goto(appUrl);
      console.info('page is open');
      //header
      await page.waitForXPath(`//h1[text() = '${settings.test.header}']`);
      console.info('header is present');
      //group headers
      await page.waitForXPath(`//a[contains(text(), '${settings.test.section}')]`);
      console.info('group headers are ok');
      //card
      await page.waitForSelector(`.mosaic img[src='/logos/${settings.test.logo}']`);
      console.info('there is a kubernetes card');
      //click on a card
      await page.click(`.mosaic img[src='/logos/${settings.test.logo}']`);
      console.info('it is clickable');
      //await for a modal
      await page.waitForSelector(".modal-content");
      console.info('modal appears');
    }, 6 * 60 * 1000); //give it up to 1 min to execute
  });
}

describe("Normal browser", function() {
  beforeAll(async function() {
    browser = await puppeteer.launch({headless: !process.env.SHOW_BROWSER});
    page = await browser.newPage();
    await page.setViewport({ width, height });
  })
  afterAll(async function() {
    browser.close();
  })
  mainTest();
});

describe("iPhone simulator", function() {
  beforeAll(async function() {
    browser = await puppeteer.launch({headless: !process.env.SHOW_BROWSER});
    page = await browser.newPage();
    await page.emulate(devices['iPhone X'])
  })

  afterAll(async function() {
    browser.close();
  })
  mainTest();
});
