import traverse from 'traverse';
import { settings, } from './settings';
import { landscape, saveLandscape } from "./landscape";
import { updateProcessedLandscape } from "./processedLandscape";

if (settings.global.short_name === 'LFPH') {
  const newLandscape = traverse(landscape).map(node => {
    if (node && node.repo_url === 'https://github.com/CovidShield/mobile' && !node.project_org) {
      const { additional_repos, ...rest } = node
      return { ...rest, project_org: 'https://github.com/CovidShield' }
    }
    return node
  })

  saveLandscape(newLandscape)
}

updateProcessedLandscape(processedLandscape => {
  return traverse(processedLandscape).map(node => {
    if (node && node.hasOwnProperty('item') && node.repo_url === 'https://github.com/CovidShield/mobile' && !node.repos) {
      const { github_data, github_start_commit_data, ...rest } = node
      return rest
    }
    if (node && node.hasOwnProperty('item') && node.repo_url && !node.repos) {
      const { additional_repos, ...rest } = node
      const repos = [{ url: node.repo_url, stars: node.github_data.stars }, ...(additional_repos || []).map(repo => ({ url: repo.repo_url, stars: 0 }))]
      return { ...rest, repos }
    }
  })
})

updateProcessedLandscape(processedLandscape => {
  return traverse(processedLandscape).map(node => {
    if (node && node.crunchbase === 'https://www.crunchbase.com/organization/octo-technology' && node.crunchbase_data.ticker === 'ALOCT.PA') {
      const { crunchbase_data, ...rest } = node
      return rest
    }
  })
})
