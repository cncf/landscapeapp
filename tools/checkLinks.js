import { exec } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import colors from 'colors'
import Promise from 'bluebird'
import traverse from 'traverse'
import { landscape } from './landscape'

const fatal = _ => colors.red(_)
const warning = _ => colors.yellow(_)
const redirect = _ => colors.magenta(_)

try {
  unlinkSync('/tmp/links.json');
} catch(ex) {

}

const getUrls = () => {
  return traverse(landscape).reduce((acc, node) => {
    if (node && node.hasOwnProperty('item') && node.homepage_url) {
      acc.add(node.homepage_url)
    }
    return acc
  }, new Set())
}

const checkUrl = url => {
    return new Promise(resolve => {
        const curlOptions = [
            '--fail',
            '--location',
            '--silent',
            '--insecure ',
            '--max-time 60',
            '--output /dev/null',
            '-H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15)"',
            '-H "Connection: keep-alive"',
            '-H "Accept: text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8"',
            '--write-out "{\\"effectiveUrl\\":\\"%{url_effective}\\",\\"status\\":\\"%{http_code}\\"}"'
        ].join(' ')
        const command = `curl ${curlOptions} ${url}`
        exec(command, (error, stdout) => {
            const { effectiveUrl, status } = JSON.parse(stdout)
            if (error) {
                resolve({ success: false, status: status || 'UNKNOWN' })
            } else {
                resolve({ effectiveUrl, success: true })
            }
        })
    })
}

const normalizeUrl = url => {
  if (url) {
    return url.replace('www.', '')
      .replace(/\?.*/, '')
      .replace(/\/$/, '')
  }
}

const main = async () => {
  const urls = getUrls();
  const errors = []
  const redirects = {}
  const warnings = []
  await Promise.map(urls, async url => {
    const { status, success, effectiveUrl } = await checkUrl(url);
    if (success && normalizeUrl(url) !== normalizeUrl(effectiveUrl)) {
      redirects[url] = effectiveUrl
      process.stdout.write(redirect('R')) 
    } else if (success) {
      process.stdout.write('.') 
    } else if (status === '403') {
      warnings.push(url)
      process.stdout.write(warning('W'))
    } else {
      errors.push(url)
      process.stdout.write(fatal('F'))
    }
  }, {concurrency: 20});
  console.info('');
  const messages = [
    ...errors.map(url => `ERROR: invalid URL ${url}`),
    ...warnings.map(url => `WARNING: could not verify ${url}`),
    ...Object.keys(redirects).map(url => `REDIRECT: ${url} ==> ${redirects[url]}`)
  ]
  const result = {
    numberOfErrors: errors.size,
    numberOfRedirects: Object.keys(redirects).length,
    messages
  }
  console.log(messages.join("\n"))
  writeFileSync('/tmp/links.json', JSON.stringify(result, null, 4));
}

main();
