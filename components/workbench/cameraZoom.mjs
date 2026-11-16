// Defines the room camera zoom boundaries, scale conversions, and display formatting.
// roomZoomBridge keeps the React overlay synchronized with OrbitControls without coupling either component to the other.
export const ROOM_MIN_DISTANCE = 6;
export const ROOM_MAX_DISTANCE = 24;
export const ZOOM_TICK_COUNT = 17;

export const roomZoomBridge = (() => {
  let api = null;
  const listeners = new Set();
  return {
    getApi: () => api,
    setApi(next) { api = next; listeners.forEach(listener => listener(next)); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
})();

export function clampZoomProgress(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

export function distanceForZoomProgress(progress, minDistance = ROOM_MIN_DISTANCE, maxDistance = ROOM_MAX_DISTANCE) {
  return maxDistance - clampZoomProgress(progress) * (maxDistance - minDistance);
}

export function zoomProgressForDistance(distance, minDistance = ROOM_MIN_DISTANCE, maxDistance = ROOM_MAX_DISTANCE) {
  if (maxDistance <= minDistance) return 0;
  return clampZoomProgress((maxDistance - distance) / (maxDistance - minDistance));
}

export function zoomMultiplier(homeDistance, distance) {
  return distance > 0 ? homeDistance / distance : 1;
}

export function zoomTickForProgress(progress, tickCount = ZOOM_TICK_COUNT) {
  return Math.round(clampZoomProgress(progress) * (tickCount - 1));
}

export function formatZoomMultiplier(multiplier) {
  if (Math.abs(multiplier - 1) < .005) return '1×';
  return `${multiplier.toFixed(multiplier >= 2 ? 1 : 2).replace(/\.0$/, '')}×`;
}
