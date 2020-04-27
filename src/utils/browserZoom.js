import isDesktop from './isDesktop';

// This method actually checks if there's zoom on mobile device
// so it returns false for desktop browsers.
const isZoomedIn = () => {
  const { visualViewport } = window
  return !isDesktop && visualViewport && visualViewport.scale > 1;
}

export { isZoomedIn };
