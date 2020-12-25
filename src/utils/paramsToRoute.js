// TODO: think if it's better to just pass item id
const paramsToRoute = ({ mainContentMode, selectedItemId }) => {
  const path = [
    mainContentMode === 'landscape' ? null : mainContentMode,
    selectedItemId ? 'items' : null,
    selectedItemId ? selectedItemId : null,
  ].filter(_ => _)

  return ['', ...path].join('/')
}

export default paramsToRoute
