import { Spherical, Vector3 } from 'three';

// Shared screen position keeps the 3D ball and pointer pickup area aligned.
export const PAPER_AIM_Y = .68;
export const PAPER_AIM_DISTANCE = 2.3;

export function paperAimOffsetY(fov) {
  const viewHeight = 2 * PAPER_AIM_DISTANCE * Math.tan(fov * Math.PI / 360);
  return (.5 - PAPER_AIM_Y) * viewHeight;
}

export const PAPER_PICKUP_SECONDS = .32;
export function paperPickupProgress(elapsed, reduced) {
  const t = reduced ? 1 : Math.min(1, Math.max(0, elapsed / PAPER_PICKUP_SECONDS));
  return 1 - (1 - t) ** 3;
}

// The toss overlay owns gestures: dragging outside the ball orbits the same target
// with the existing room limits, without sending synthetic events to the canvas.
export function rotatePaperCamera(camera, orbit, dx, dy, height) {
  if (!orbit || height <= 0) return;
  const spherical = new Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
  const speed = 2 * Math.PI * orbit.rotateSpeed / height;
  spherical.theta = Math.max(orbit.minAzimuthAngle, Math.min(orbit.maxAzimuthAngle, spherical.theta - dx * speed));
  spherical.phi = Math.max(orbit.minPolarAngle, Math.min(orbit.maxPolarAngle, spherical.phi - dy * speed));
  camera.position.copy(orbit.target).add(new Vector3().setFromSpherical(spherical));
  camera.lookAt(orbit.target); camera.updateMatrixWorld();
}
