import traverse from 'traverse';
import updateProcessedLandscape from './updateProcessedLandscape';

updateProcessedLandscape(processedLandscape => {
  return traverse(processedLandscape).map(function () {
    if (this.parent && this.parent.key === 'acquisitions') {
      if ('price' in this.node && !this.node.price) {
        const { price, ...rest } = this.node
        this.update(rest, true)
      }

      if (this.node.acquiree.name) {
        const { acquiree, ...rest } = this.node
        this.update({ ...rest, acquiree: acquiree.name }, true)
      }
    }
  })
})

