import _ from 'lodash';
import colors from 'colors';
import rp from 'request-promise';
import Promise from 'bluebird';
const traverse = require('traverse');
import path from 'path';
import retry from './retry';
import { projectPath } from './settings';

const fatal = (x) => colors.red(colors.inverse(x));
const rpWithRetry = async function(args) {
  return await retry(() => rp(args), 2, 1000);
}

process.setMaxListeners(0);


try {
  require('fs').unlinkSync('/tmp/links.json');
} catch(ex) {

}


async function getLandscapeItems() {
  const source = require('js-yaml').safeLoad(require('fs').readFileSync(path.resolve(projectPath, 'landscape.yml')));
  const tree = traverse(source);
  const items = [];
  tree.map(function(node) {
    if (!node) {
      return;
    }
    if (node.item !== null) {
      return;
    }
    items.push({homepageUrl: node.homepage_url, repo: node.repo_url, name: node.name});
  });
  return _.uniq(items);
}

export async function checkUrl(url) {
  function getFullLocation(url, redirect) {
    if (redirect.indexOf('http') === 0) {
      return redirect;
    }
    const { URL } = require('url');
    const myURL = new URL(url);
    return `${myURL.protocol}//${myURL.host}${redirect}`;
  }

  async function checkViaPuppeteer(remainingAttempts = 3) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']});

    const page = await browser.newPage();
    page.setViewport({width: 1920, height: 1024});
    page.setDefaultNavigationTimeout(120 * 1000);
    let result = null;
    try {
      await page.goto(url);
      await Promise.delay(5 * 1000);
      const newUrl = await page.evaluate ( (x) => window.location.href );
      await browser.close();
      const withoutTrailingSlash = (x) => x.replace(/#(.*)/, '').replace(/\/$/, '');
      if (withoutTrailingSlash(newUrl) === withoutTrailingSlash(url)) {
        return 'ok';
      } else {
        return {type: 'redirect', location: withoutTrailingSlash(newUrl)};
      }
    } catch(ex2) {
      await browser.close();
      if (remainingAttempts > 0 ) {
        return await checkViaPuppeteer(remainingAttempts - 1)
      } else {
        const normalCheck = await checkWithRequest();
        if (normalCheck !== 'ok') {
          return normalCheck;
        }
        return {type: 'mayRedirect', message: ex2.message.substring(0, 200)};
      }
    }
  }

  async function quickCheckViaPuppeteer(remainingAttempts = 3) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']});
    const page = await browser.newPage();
    page.setViewport({width: 1920, height: 1024});
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.resourceType() !== 'document')
        request.abort();
      else
        request.continue();
    });
    page.setDefaultNavigationTimeout(120 * 1000);
    let result = null;

    try {
      page.on('response', response => {
        const status = response.status()
        if (url === response.request().url() || url + '/' === response.request().url) {
          if ((status >= 300) && (status <= 399)) {
            result = {type: 'redirect', location: response.headers()['location']};
          }
          else if (status >= 400) {
            result = {type: 'error', status: status};
          }
        }
      })
      await page.goto(url);
      result = result || 'ok';
      await browser.close();
      return result;
    } catch(ex2) {
      await browser.close();
      if (remainingAttempts > 0) {
        await Promise.delay(10 * 1000);
        return await quickCheckViaPuppeteer(remainingAttempts - 1);
      } else {
        return {type: 'error', message: ex2.message.substring(0, 200)};
      }
    }
  }

  async function checkWithRequest() {
    const result = await rpWithRetry({
      followRedirect: false,
      url: url,
      timeout: 45 * 1000,
      simple: false,
      resolveWithFullResponse: true,
      headers: { // make them think we are a real browser from us
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,es',
        'cache-control': 'no-cache',
        dnt: '1',
        pragma: 'no-cache',
        'upgrade-insecure-requests': 1,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
      }
    });
    if (result.statusCode === 200) {
      return 'ok';
    }
    else if (result.statusCode >= 300 && result.statusCode < 400) {
      return { type: 'redirect', location: getFullLocation(url, result.headers.location)};
    } else {
      return {type: 'error', status: result.statusCode};
    }
  }

  const result = await quickCheckViaPuppeteer(); // detect errors and http redirects
  if (result !== 'ok') {
    return result;
  }
  return await checkViaPuppeteer();
}

function formatError(record) {
  if (record.type === 'redirect' && record.homepageUrl) {
    return `REDIRECT: homepage ${record.homepageUrl} redirects to ${record.location}`;
  }
  if (record.type === 'redirect' && record.repo) {
    return `REDIRECT: repo ${record.repo} redirects to ${record.location}`;
  }
  if (record.type === 'error') {
    const kind = record.homepageUrl ? `homepage ${record.homepageUrl}` : `repo ${record.repo}`;
    const statusPart = record.status ? `has a status ${record.status}` : null;
    const messagePart = record.message ? `has an error ${record.message}` : null;
    const info = [statusPart, messagePart].filter( (x) => !!x).join(' and ');
    return `ERROR: ${kind} ${info}`;
  }
  if (record.type === 'mayRedirect') {
    const kind = record.homepageUrl ? `homepage ${record.homepageUrl}` : `repo ${record.repo}`;
    const statusPart = record.status ? `has a status ${record.status}` : null;
    const messagePart = record.message ? `has an error ${record.message}` : null;
    const info = [statusPart, messagePart].filter( (x) => !!x).join(' and ');
    return `WARNING: ${kind} ${info}. curl request is OK, but curl can not detect a javascript redirect`;
  }

}

async function main() {
  const items = await getLandscapeItems();
  const errors= [];
  await Promise.map(items, async function(item) {
    const result = await checkUrl(item.homepageUrl);
    if (result !== 'ok') {
      errors.push({'homepageUrl': item.homepageUrl,...result});
      require('process').stdout.write(fatal("F"));
      console.info(result);
    } else {
      require('process').stdout.write(".");
    }
  }, {concurrency: 4});
  await Promise.map(items, async function(item) {
    if (item.repo) {
      const result = await checkUrl(item.repo);
      if (result !== 'ok') {
        errors.push({'repo': item.repo, ...result});
        require('process').stdout.write(fatal("F"));
        console.info(result);
      } else {
        require('process').stdout.write(".");
      }
    }
  }, {concurrency: 4});
  console.info('');
  const uniqErrors = _.uniq(errors);
  const errorsText = uniqErrors.map( (x) => formatError(x)).join('\n');
  const redirectsCount = uniqErrors.filter( (x) => x.type === 'redirect').length;
  const errorsCount = uniqErrors.filter( (x) => x.type !== 'redirect').length;
  const result = {
    numberOfErrors: errorsCount,
    numberOfRedirects: redirectsCount,
    messages: errorsText
  }
  console.info(result);
  require('fs').writeFileSync('/tmp/links.json', JSON.stringify(result, null, 4));
}
main();
