import { exec } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import colors from 'colors'
import Promise from 'bluebird'
import traverse from 'traverse'
import { landscape, saveLandscape } from './landscape'
import { updateProcessedLandscape } from './processedLandscape'

const fatal = _ => colors.red(_)
const warning = _ => colors.yellow(_)
const redirect = _ => colors.magenta(_)

try {
  unlinkSync('/tmp/links.json');
} catch(ex) {

}

const getUrls = () => {
  return traverse(landscape).reduce((acc, node) => {
    if (node && node.hasOwnProperty('item')) {
      if (node.homepage_url) {
        acc.add(node.homepage_url)
      }

      if (node.repo_url) {
        acc.add(node.repo_url)
      }
    }
    return acc
  }, new Set())
}

const checkUrl = (url, attempt = 1) => {
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
        exec(command, async (error, stdout) => {
            const { effectiveUrl, status } = JSON.parse(stdout)
            if (error && status === '429' && attempt <= 5) {
              console.log("Rate limitted, waiting 30s. URL: ", url)
              await new Promise(resolve => setTimeout(resolve, 30000))
              resolve(await checkUrl(url, attempt + 1))
            } else if (error) {
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
      .replace(/#.*/, '')
      .replace(/\?.*/, '')
      .replace(/\/$/, '')
  }
}

const fixRedirects = (source, redirects) => {
  return traverse(source).map(node => {
    let newNode = node
    if (node && node.hasOwnProperty('item')) {
      const { homepage_url, repo_url } = node
      if (homepage_url && redirects[homepage_url]) {
        newNode = { ...node, homepage_url: redirects[homepage_url] }
      }

      if (repo_url && redirects[repo_url]) {
        newNode = { ...node, repo_url: redirects[repo_url] }
      }
    }
    return newNode
  })
}

// To minimize getting rate limitted by Github we want to 
// limit how many requests we perform every minute.
const addDelays = urls => {
  // 80 reqs/min for Github URL
  const githubUrls = urls.filter(u => u.indexOf('github.com') > -1)
    .map((url, idx) => ({ url, delay: Math.floor(idx / 80) * 60 * 1000 }))

  // 20 reqs/s for rest of URLs
  const nonGithubUrls = urls.filter(u => u.indexOf('github.com') === -1)
    .map((url, idx) => ({ url, delay: Math.floor(idx / 20) * 1000 }))
  
  return [...githubUrls, ...nonGithubUrls]
}

const main = async () => {
  const urls = addDelays([...getUrls()])
  const errors = []
  const redirects = {}
  const warnings = []
  await Promise.map(urls, async ({ url, delay }) => {
    await new Promise(resolve => setTimeout(resolve, delay))
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
  })
  console.info('');
  const messages = [
    ...errors.map(url => `ERROR: invalid URL ${url}`),
    ...warnings.map(url => `WARNING: could not verify ${url}`),
  ].join("\n")
  const result = { numberOfErrors: errors.length, messages }
  console.log(messages)
  saveLandscape(fixRedirects(landscape, redirects))
  updateProcessedLandscape(processedLandscape => fixRedirects(processedLandscape, redirects))
  writeFileSync('/tmp/links.json', JSON.stringify(result, null, 4));
}

main();
