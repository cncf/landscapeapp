import { existsSync } from 'fs'
import puppeteer from "puppeteer";
const { AxePuppeteer } = require('axe-puppeteer');
import { appUrl } from '../tools/distSettings'
import { projectPath } from '../tools/settings'

const analyzePage = async url => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], defaultViewport: { width: 1600, height: 1200 }});
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector('.app')
  const results = await new AxePuppeteer(page).withTags('wcag2a').analyze()
  await browser.close()

  if (results.violations.length > 0) {
    const output = [
      'Encountered the following accessibility issues:',
      ...results.violations.flatMap(violation => {
        return [
          '',
          `[${violation.impact}] ${violation.help}:`,
          `  DESCRIPTION: ${violation.helpUrl}`,
          '  ELEMENTS:',
          ...violation.nodes.flatMap(node => `    * ${node.html}`),
        ]
      })
    ].join('\n')

    throw output
  }
}

describe("Accessibility", () => {
  test("Main Landscape", async () => {
    await analyzePage(appUrl)
  }, 60 * 1000);

  test("Card Mode", async () => {
    await analyzePage(`${appUrl}/card-mode`)
  }, 60 * 1000);

  if (existsSync(`${projectPath}/guide`)) {
    test("Guide", async () => {
      await analyzePage(`${appUrl}/guide`)
    }, 60 * 1000);
  }
});
