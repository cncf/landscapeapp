import currentDevice from './currentDevice'

// This method actually checks if there's zoom on mobile device
// so it returns false for desktop browsers.
const isZoomedIn = () => {
  const { visualViewport } = window
  return !currentDevice.desktop() && visualViewport && visualViewport.scale > 1;
}

export { isZoomedIn };
