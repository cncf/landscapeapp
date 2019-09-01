import rp from './rpRetry';
import { JSDOM } from 'jsdom';

const makeApiRequest = ({ path = null, url = null, method = 'GET' }) => {
  if (path) {
    url = `https://api.github.com${path}`;
  }

  return rp({
    method: method,
    uri: url,
    followRedirect: true,
    timeout: 10 * 1000,
    headers: {
      'User-agent': 'CNCF',
      'Authorization': `token ${process.env.GITHUB_KEY}`
    },
    json: true
  })
}

async function readGithubStats({repo, branch}) {
  var url = `https://github.com/${repo}/commits/${branch}`;
  var response
  try {
    response = await rp({
    uri: url,
    followRedirect: true,
    timeout: 10 * 1000,
    simple: true
    });
  } catch(ex) {
    throw new Error(`Check if ${repo} has a branch ${branch}`);
  }
  const dom = new JSDOM(response);
  const doc = dom.window.document;
  const commitLinks = doc.querySelectorAll('.commits-list-item a.sha');
  const firstCommitLink = commitLinks[0].href;
  // console.info(doc.querySelector('body').innerHTML);
  const firstCommitDateText = (doc.querySelectorAll('.commit-group-title')[0] || {}).textContent;
  const firstCommitDate = new Date(firstCommitDateText.split(' on ')[1]).toISOString();
  //nextPageLink may not present for small repos!
  const nextPageLink = (Array.from(doc.querySelectorAll('.paginate-container a')).filter(function(x) {
    return x.text === 'Older';
  })[0] || {}).href;
  if (!nextPageLink) {
    return {
      firstCommitLink,
      firstCommitDate,
      lastCommitLink: commitLinks[commitLinks.length - 1].href
    };
  }
  const [base, offset] = nextPageLink.split('+');
  // console.info(await getPageInfo(doc));
  return {
    base,
    offset,
    firstCommitDate,
    firstCommitLink
  }
}
export async function getReleaseDate({repo}) {
  const releases = await makeApiRequest({ path: `/repos/${repo}/releases` });

  if (releases.length > 0) {
    return releases[0].published_at;
  }
}

export async function getRepoLatestDate({repo, branch}) {
  const info = await readGithubStats({repo, branch});
  // console.info(info);
  return {
    date: info.firstCommitDate,
    commitLink: info.firstCommitLink
  }
}

const getBranchSha = async (repo, branch) => {
  const { commit } = await makeApiRequest({ path: `/repos/${repo}/branches/${branch}` });
  return commit.sha;
}

const getUrlFromLinkHeader = (link, rel) => {
  if (link) {
    return link.split(',')
      .find((text) => text.indexOf(`rel="${rel}"`) > -1)
      .split(';')[0]
      .replace(/<|>/g, '');
  }
}

const getCommitsLastPagePath = async (repo, branchSha) => {
  const path = `/repos/${repo}/commits?sha=${branchSha}`;

  const { link } = await makeApiRequest({ path, method: 'HEAD' });
  const url = getUrlFromLinkHeader(link, 'last');
  if (!url) {
    return path;
  }
  const { pathname, search } = new URL(url);
  return pathname + search;
}

export async function getRepoStartDate({repo, branch}) {
  const branchSha = await getBranchSha(repo, branch);
  const commitsLastPagePath = await getCommitsLastPagePath(repo, branchSha);
  const commits = await makeApiRequest({ path: commitsLastPagePath })
  const lastCommit = commits[commits.length - 1];
  const commitLink = (new URL(lastCommit.html_url)).pathname;
  return { date: lastCommit.commit.author.date, commitLink: commitLink };
}
