const paramsToRoute = ({ mainContentMode, selectedItem }) => {
  const path = [
    mainContentMode === 'landscape' ? null : mainContentMode,
    selectedItem ? 'items' : null,
    selectedItem ? selectedItem.id : null,
  ].filter(_ => _)

  return ['', ...path].join('/')
}

export default paramsToRoute
