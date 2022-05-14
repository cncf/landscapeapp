import 'regenerator-runtime/runtime';
import puppeteer from "puppeteer";
import 'expect-puppeteer';
import { paramCase } from 'change-case';
import { settings } from '../tools/settings';
import { projects } from '../tools/loadData';
import { landscapeSettingsList } from "../src/utils/landscapeSettings";
import { appUrl, pathPrefix } from '../tools/distSettings'

const devicesMap = puppeteer.devices;
const width = 1920;
const height = 1080;

let browser;
let page;
let close = () => test('Closing a browser', async () => await browser.close());

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
jest.setTimeout(process.env.SHOW_BROWSER ? 30000 : 30000);

async function makePage(initialUrl) {
  try {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: !process.env.SHOW_BROWSER});
    const page = await browser.newPage();
    await page.goto(initialUrl);
    await page.setViewport({ width, height });
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

async function waitForSelector(page, selector) {
  await page.waitForFunction(`document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`);
}

async function waitForSummaryText(page, text) {
  await page.waitForFunction(`document.querySelector('.summary') && document.querySelector('.summary').innerText.includes('${text}')`);
}

async function waitForHeaderText(page, text) {
  await page.waitForFunction(`[...document.querySelectorAll('.sh_wrapper')].find( (x) => x.innerText.includes('${text}'))`);
}

describe("Embed test", () => {
  describe("I visit an example embed page", () => {
    let frame;
    test('page is open and has a frame', async function(){
      page = await makePage(appUrl + '/embed');
      frame = await page.frames()[1];
      await frame.waitForSelector('.cards-section .mosaic');
      await frame.waitForXPath(`//h1[contains(text(), 'full interactive landscape')]`);
    });

    test('Do not see a content from a main mode', async function() {
      const title = await frame.$('h1', { text: settings.test.header })
      expect(await title.boundingBox()).toBe(null)
    });

    // ensure that it is clickable
    test('I can click on a tile in a frame and I get a modal after that', async function() {
      await waitForSelector(frame, ".cards-section .mosaic img");
      await frame.click(`.mosaic img`);
    });
    close();
  }, 6 * 60 * 1000); //give it up to 1 min to execute
});

describe("Main test", () => {
  describe("I visit a main page and have all required elements", () => {
    test('I can open a page', async function() {
      page = await makePage(appUrl + '/card-mode');
      await page.waitForSelector('.cards-section .mosaic');
    });

    //header
    test('A proper header is present', async function() {
      await expect(page).toHaveElement(`//h1[text() = '${settings.test.header}']`);
    });

    test('Group headers are ok', async function() {
      await waitForHeaderText(page, settings.test.section);
    });

    test('I see a You are viewing text', async function() {
      await waitForSummaryText(page, 'You are viewing ');
    });

    test(`A proper card is present`, async function() {
      await expect(page).toHaveElement(`.mosaic img[src='${pathPrefix}/logos/${settings.test.logo}']`);
    });

    test(`If I click on a card, I see a modal dialog`, async function() {
      await page.click(`.mosaic img[src='${pathPrefix}/logos/${settings.test.logo}']`);
      await waitForSelector(page, ".modal-content .product-logo");
    });
    close();
  }, 6 * 60 * 1000); //give it up to 1 min to execute
});

describe("Landscape Test", () => {
  describe("I visit a main landscape page and have all required elements", () => {
    test('I open a landscape page and wait for it to load', async function() {
      page = await makePage(appUrl);
      await page.waitForSelector('.cards-section [data-mode=main]');
    });
    test('When I click on an item the modal is open', async function() {
      await waitForSelector(page, '.cards-section [data-mode=main] [data-id]');
      await page.click('.cards-section [data-mode=main] [data-id]');
      await waitForSelector(page, ".modal-content .product-logo");
    });

    test('If I would straight open the url with a selected id, a modal appears', async function() {
      await page.goto(appUrl);
      await waitForSelector(page, '.cards-section [data-mode=main] [data-id]');
      await page.click('.cards-section [data-mode=main] [data-id]');
      await waitForSelector(page, ".modal-content .product-logo");
    });
    close();
  }, 6 * 60 * 1000); //give it up to 1 min to execute
  landscapeSettingsList.slice(1).forEach(({ name, basePath, url }) => {
    test(`I visit ${name} landscape page and have all required elements, elements are clickable`, async () => {
      const page = await makePage(`${appUrl}/${basePath}`);
      await waitForSelector(page, `.cards-section [data-mode=${url}] [data-id]`);
      await page.click(`.cards-section [data-mode=${url}] [data-id]`);
      await waitForSelector(page, ".modal-content .product-logo");
    }, 6 * 60 * 1000); //give it up to 1 min to execute
    close();
  })
});

describe("Filtering by organization", () => {
  const project = projects[0];
  const organizationSlug = paramCase(project.organization);
  const otherProject = projects.find(({ organization }) => organization.toLowerCase() !== project.organization.toLowerCase());
  if (otherProject) {
    const otherOrganizationSlug = paramCase(otherProject.organization);

    test(`Checking we see ${project.name} when filtering by organization ${project.organization}`, async function() {
      page = await makePage(`${appUrl}/card-mode?organization=${organizationSlug}`);
      await page.waitForSelector('.cards-section .mosaic');
      await expect(page).toHaveElement(`//div[contains(@class, 'mosaic')]//*[text()='${project.name}']`);
    });
    test(`Checking we don't see ${project.name} when filtering by organization ${otherProject.organization}`, async function() {
      await page.goto(`${appUrl}/card-mode?organization=${otherOrganizationSlug}`);
      await page.waitForSelector('.cards-section .mosaic');
      await expect(page).not.toHaveElement(`//div[contains(@class, 'mosaic')]//*[text()='${project.name}']`);
    });
  }
  close();
}, 6 * 60 * 1000);
