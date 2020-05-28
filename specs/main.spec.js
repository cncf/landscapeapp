import puppeteer from "puppeteer";
require('expect-puppeteer');
import { devicesMap } from 'puppeteer/DeviceDescriptors';
import { paramCase } from 'change-case';
import { settings } from '../tools/settings';
import { projects } from '../tools/loadData';
import { landscapeSettingsList } from "../src/utils/landscapeSettings";
const port = process.env.PORT || '4000';
const appUrl = `http://localhost:${port}`;
const width = 1920;
const height = 1080;
let browser;
let setup;

expect.extend({
  async toHaveElement(page, selectorOrXpath) {
    const method = selectorOrXpath.slice(0, 2) === '//' ? '$x' : '$$';
    const elements = await page[method](selectorOrXpath);
    const pass = elements.length > 0;
    const message = () => {
      return `Element "${selectorOrXpath}" ${this.isNot ? "was not supposed to" : "could not"} be found.`
    };
    return { pass, message };
  },
})

jest.setTimeout(process.env.SHOW_BROWSER ? 30000 : 20000);

async function makePage(initialUrl) {
  try {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: !process.env.SHOW_BROWSER});
    const page = await browser.newPage();
    await setup(page);
    await page.goto(initialUrl);
    return page;
  } catch(ex) {
    try {
      console.info('retrying...', ex);
      browser.close();
    } catch(ex2) {

    }
    return await makePage(initialUrl);
  }
}

function embedTest() {
  describe("Embed test", () => {
    test("I visit an example embed page", async () => {
      console.info('about to open a page', appUrl);
      const page = await makePage(appUrl + '/embed.html');
      console.info('page is open');

      const frame = await page.frames()[1];
      // should be a clickable frame
      await frame.waitForXPath(`//h1[contains(text(), 'full interactive landscape')]`);
      // we should not see the content from a main mode
      await expect(frame).not.toHaveElement(`//h1[text() = '${settings.test.header}']`);

      // ensure that it is clickable
      await expect(frame).toHaveElement(`.mosaic img`);
      await frame.click(`.mosaic img`);
      await frame.waitForSelector(".modal-content");
    }, 6 * 60 * 1000); //give it up to 1 min to execute
  });
}

function mainTest() {
  describe("Main test", () => {
    test("I visit a main page and have all required elements", async () => {
      console.info('about to open a page', appUrl + '/format=card-mode');
      const page = await makePage(appUrl + '/format=card-mode');
      console.info('page is open');
      await page.waitFor('.cards-section');

      //header
      await expect(page).toHaveElement(`//h1[text() = '${settings.test.header}']`);
      console.info('header is present');
      //group headers
      await expect(page).toHaveElement(`//a[contains(text(), '${settings.test.section}')]`);
      console.info('group headers are ok');
      // ensure that everything was loaded
      await expect(page).toHaveElement(`//*[contains(text(), 'You are viewing ')]`);
      console.info('group headers are ok');
      //card
      await expect(page).toHaveElement(`.mosaic img[src='logos/${settings.test.logo}']`);
      console.info('there is a kubernetes card');
      //click on a card
      await page.click(`.mosaic img[src='logos/${settings.test.logo}']`);
      console.info('it is clickable');
      //await for a modal
      await page.waitForSelector(".modal-content");
      console.info('modal appears');
    }, 6 * 60 * 1000); //give it up to 1 min to execute
  });
}

function landscapeTest() {
  describe("Big Picture Test", () => {
    test("I visit a main landscape page and have all required elements", async () => {
      console.info('about to open a main landscape page');
      const page = await makePage(appUrl);
      await page.waitForSelector('.big-picture-section');
      await page.click('.big-picture-section img[src]');
      await page.waitForSelector(".modal-content");

      // and check that without redirect it works too
      await page.goto(appUrl);
      await page.waitForSelector('.big-picture-section');
      await page.click('.big-picture-section img[src]');
      await page.waitForSelector(".modal-content");
    }, 6 * 60 * 1000); //give it up to 1 min to execute
  });
  landscapeSettingsList.slice(1).forEach(({ name, url }) => {
    test(`I visit ${name} landscape page and have all required elements`, async () => {
      console.info(`about to open ${name} landscape page`);
      const page = await makePage(`${appUrl}/format=${url}`);
      await page.waitForSelector('.big-picture-section');
      await page.click('.big-picture-section img[src]');
      await page.waitForSelector(".modal-content");
    }, 6 * 60 * 1000); //give it up to 1 min to execute
  })
}

describe("Normal browser", function() {
  beforeEach(async function() {
    setup = async (page) =>  await page.setViewport({ width, height });
  })
  afterEach(async function() {
    browser.close();
  })
  mainTest();
  landscapeTest();
  embedTest();

  test("Filtering by organization", async () => {
    const project = projects[0];
    const organizationSlug = paramCase(project.organization);
    const otherProject = projects.find(({ organization }) => organization !== project.organization);
    const otherOrganizationSlug = paramCase(otherProject.organization);

    console.log(`Checking we see ${project.name} when filtering by organization ${project.organization}`);
    const page = await makePage(`${appUrl}/organization=${organizationSlug}&format=card-mode`);
    await expect(page).toHaveElement(`//div[contains(@class, 'mosaic')]//*[text()='${project.name}']`);

    console.log(`Checking we don't see ${project.name} when filtering by organization ${otherProject.organization}`);
    await page.goto(`${appUrl}/organization=${otherOrganizationSlug}&format=card-mode`);
    await expect(page).not.toHaveElement(`//div[contains(@class, 'mosaic')]//*[text()='${project.name}']`);
  }, 6 * 60 * 1000);
});

describe("iPhone simulator", function() {
  beforeEach(async function() {
    setup = async (page) => await page.emulate(devicesMap['iPhone X'])
  })

  afterEach(async function() {
    browser.close();
  })
  mainTest();
  landscapeTest();
});
