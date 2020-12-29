export const outerPadding = 20
export const headerHeight = 40

// Calculate width and height of a given landscape
export const calculateSize = landscapeSettings => {
  return {
    width: Math.max(...landscapeSettings.elements.map(({ left, width }) => left + width)),
    height: Math.max(...landscapeSettings.elements.map(({ top, height }) => top + height))
  }
}
