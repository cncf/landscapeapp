const traverse = require('traverse');
const _ = require('lodash');
const Promise = require('bluebird');
const { GithubClient } = require('./apiClients');
const { landscape } = require('./landscape');
const { processedLandscape } = require('./processedLandscape');

const cacheKey = module.exports.cacheKey =  (url, branch) => `${url}#${branch}`

const deleteReposWithNewAdditionalRepos = (cache) => {
  const processedAdditionalRepos = traverse(processedLandscape).reduce((acc, node) => {
    if (node && node.repos && node.repos.length > 1) {
      acc[node.repo_url] = node.repos
        .map(({ url }) => url)
        .filter(url => url !== node.repo_url)
        .sort()
    }
    return acc
  }, {})

  traverse(landscape).forEach(node => {
    if (node && node.repo_url && node.additional_repos) {
      const additionalRepos = node.additional_repos.map(({ repo_url }) => repo_url).sort()

      if (JSON.stringify(processedAdditionalRepos[node.repo_url]) !== JSON.stringify(additionalRepos)) {
        delete cache[cacheKey(node.repo_url, node.branch)]
      }
    }
  })
}

const getProcessedRepos = () => {
  let processedRepos = traverse(processedLandscape).reduce((acc, node) => {
    if (node && node.github_data && node.repo_url) {
      acc[cacheKey(node.repo_url, node.branch)] = {
        ...node.github_data,
        repos: node.repos,
        url: node.repo_url,
        branch: node.branch
      }
    }
    return acc
  }, {})

  deleteReposWithNewAdditionalRepos(processedRepos)

  return processedRepos
}
module.exports.getProcessedRepos = getProcessedRepos;

const getProcessedGithubOrgs = () => {
  return traverse(processedLandscape).reduce((acc, node) => {
    if (node && node.github_data && node.project_org) {
      const { project_org, github_data, github_start_commit_data, repos } = node
      acc[project_org] = { github_data, github_start_commit_data, repos, url: project_org }
    }
    return acc
  }, {})
}
module.exports.getProcessedGithubOrgs = getProcessedGithubOrgs;

const getOrganizations = () => {
  const orgs = traverse(landscape).reduce((acc, node) => {
    if (node && node.project_org && node.hasOwnProperty('item')) {
      acc.push({ url: node.project_org })
    }
    return acc
  }, [])
  return orgs
}
module.exports.getOrganizations = getOrganizations;

const fetchGithubOrgs = async preferCache => {
  const githubOrgs = getOrganizations()
  const processedGithubOrgs = getProcessedGithubOrgs()
  const result = await Promise.map(githubOrgs, async ({ url }) => {
    const processedOrg = processedGithubOrgs[url]
    if (processedOrg && preferCache) {
      const { github_data, github_start_commit_data, repos } = processedOrg
      return { data: { url, repos, cached: true }, github_data, github_start_commit_data }
    }
    const orgName = url.split('/').pop()
    try {
      const { description } = await GithubClient.request({ path: `orgs/${orgName}` })
      const params = { type: 'public', per_page: 100 }
      const path = `orgs/${orgName}/repos`
      const response = await GithubClient.request({ path, params })
      const repos = response.map(({ html_url, default_branch, size }) => {
        if (size > 0) {
          return { url: html_url, branch: default_branch, multiple: true }
        }
      }).filter(_ => _)
      return { data: { url, repos }, github_data: { description } }
    } catch(ex) {
      console.info(`Failed to fetch org: ${orgName}`);
      return null
    }
  }, { concurrency: 10 })
  return result.filter( (x) => !!x);
}
module.exports.fetchGithubOrgs = fetchGithubOrgs;

const getRepos = () => {
  const repos = traverse(landscape).reduce((acc, node) => {
    if (node && node.repo_url && node.hasOwnProperty('item') && !node.project_org) {
      acc.push({ url: node.repo_url, branch: node.branch, multiple: !!node.additional_repos })

      if (node.additional_repos) {
        node.additional_repos.forEach(additional => {
          acc.push({
            url: additional.repo_url,
            branch: additional.branch,
            parent: cacheKey(node.repo_url, node.branch),
            multiple: true
          })
        })
      }
    }
    return acc
  }, [])
  return _.uniq(repos);
}
module.exports.getRepos = getRepos;

const getProcessedReposStartDates = () => {
  let processedReposStartDates = traverse(processedLandscape).reduce((acc, node) => {
    if (node && node.github_start_commit_data) {
      acc[cacheKey(node.repo_url, node.branch)] = { ...node.github_start_commit_data,  url: node.repo_url, branch: node.branch }
    }
    return acc
  }, {})

  deleteReposWithNewAdditionalRepos(processedReposStartDates)

  return processedReposStartDates
}
module.exports.getProcessedReposStartDates = getProcessedReposStartDates;
