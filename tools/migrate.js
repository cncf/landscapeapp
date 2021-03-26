import { landscape, saveLandscape } from './landscape'
import traverse from 'traverse'

const newLandscape = traverse(landscape).map(node => {
  if (node && node.other_repo_url) {
    const { other_repo_url, ...rest } = node
    const extra = other_repo_url ? { repo_url: other_repo_url } : {}
    return { ...rest, ...extra }
  }
  return node
})

saveLandscape(newLandscape)
