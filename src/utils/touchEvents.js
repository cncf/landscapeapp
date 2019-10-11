const onSwipe = ({ left, right, threshold = 50 }) => {
  let initialCoordinates, finalCoordinates = null;

  const onTouchStart = (e) => {
    initialCoordinates = null;
    finalCoordinates = null;
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 1) {
      const { clientX, clientY } = e.touches[0];

      if (!initialCoordinates) {
        initialCoordinates = { clientX, clientY };
      }

      finalCoordinates = { clientX, clientY };
    }
  }

  const onTouchEnd = (e) => {
    if (initialCoordinates && finalCoordinates) {
      const distanceX = finalCoordinates.clientX - initialCoordinates.clientX;
      const distanceY = finalCoordinates.clientY - initialCoordinates.clientY;
      initialCoordinates = null;
      finalCoordinates = null;

      if (Math.abs(distanceY) > threshold) {
        return;
      }

      if (distanceX < -1 * threshold) {
        right();
      }

      if (distanceX > threshold) {
        left();
      }
    }
  };

  window.addEventListener("touchstart", onTouchStart);
  window.addEventListener("touchmove", onTouchMove);
  window.addEventListener("touchend", onTouchEnd);

  return () => {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  }
};

export { onSwipe };
