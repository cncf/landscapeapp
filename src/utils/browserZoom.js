const isZoomedIn = () => {
  const scale = window.visualViewport ? visualViewport.scale : screen.width / window.innerWidth;
  return scale > 1;
}

export { isZoomedIn };
