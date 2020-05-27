import traverse from 'traverse'
import _ from 'lodash'
import { landscape } from './landscape'
import { processedLandscape } from './processedLandscape'

export const cacheKey = (url, branch) => `${url}#${branch}`

const deleteReposWithNewAdditionalRepos = (cache) => {
  const processedAdditionalRepos = traverse(processedLandscape).reduce((acc, node) => {
    if (node && node.repo_url && node.additional_repos) {
      acc[node.repo_url] = node.additional_repos.map(node => cacheKey(node.repo_url, node.branch)).sort()
    }
    return acc
  }, {})

  traverse(landscape).forEach(node => {
    if (node && node.repo_url && node.additional_repos) {
      const additionalRepos = node.additional_repos.map(node => cacheKey(node.repo_url, node.branch)).sort()

      if (JSON.stringify(processedAdditionalRepos[node.repo_url]) !== JSON.stringify(additionalRepos)) {
        delete cache[cacheKey(node.repo_url, node.branch)]
      }
    }
  })
}

export const getProcessedRepos = () => {
  let processedRepos = traverse(processedLandscape).reduce((acc, node) => {
    if (node && node.github_data) {
      acc[cacheKey(node.repo_url, node.branch)] = { ...node.github_data, url: node.repo_url, branch: node.branch }
    }
    return acc
  }, {})

  deleteReposWithNewAdditionalRepos(processedRepos)

  return processedRepos
}

export const getRepos = () => {
  const repos = traverse(landscape).reduce((acc, node) => {
    if (node && node.repo_url && node.hasOwnProperty('item')) {
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

export const getProcessedReposStartDates = () => {
  let processedReposStartDates = traverse(processedLandscape).reduce((acc, node) => {
    if (node && node.github_start_commit_data) {
      acc[cacheKey(node.repo_url, node.branch)] = { ...node.github_start_commit_data,  url: node.repo_url, branch: node.branch }
    }
    return acc
  }, {})

  deleteReposWithNewAdditionalRepos(processedReposStartDates)

  return processedReposStartDates
}
