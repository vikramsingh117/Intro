// Shared by the visible mount and paper physics; Y is the horizontal rim plane.
export const HOOP = Object.freeze({ x: -7.493, y: 1.8, z: .3, radius: 1.053, tube: .0715, scale: 2.6, assetRimY: .3,
  boardAxis: 'x', boardX: -9.04, boardY: 2.55, boardWidth: 1.625, boardHeight: 1.325, boardDepth: .12 });
// Mobile mount faces forward from the back wall, immediately right of the window.
export const MOBILE_HOOP = Object.freeze({ ...HOOP, x: -.9, y: 3, z: -1.473,
  boardAxis: 'z', boardX: -.9, boardZ: -3.02, boardY: 3.75 });
export const hoopForWidth = width => width <= 760 ? MOBILE_HOOP : HOOP;
export const CELEBRATION_MS = 3000;

export function crossedHoop(previous, current, radius, hoop = HOOP) {
  if (previous.y <= hoop.y || current.y > hoop.y || current.y >= previous.y) return false;
  const t = (previous.y - hoop.y) / (previous.y - current.y);
  const x = previous.x + (current.x - previous.x) * t - hoop.x;
  const z = previous.z + (current.z - previous.z) * t - hoop.z;
  const clearance = hoop.radius - hoop.tube - radius;
  return clearance > 0 && x * x + z * z <= clearance * clearance;
}

export function collideHoop(body, previous, radius, hoop = HOOP) {
  const p = body.position, v = body.velocity;
  // Swept backboard contact, including fast shots that cross its thin geometry.
  const axis = hoop.boardAxis, across = axis === 'x' ? 'z' : 'x';
  const front = (axis === 'x' ? hoop.boardX : hoop.boardZ) + hoop.boardDepth / 2 + radius;
  if (previous[axis] >= front && p[axis] < front && v[axis] < 0) {
    const t = (previous[axis] - front) / (previous[axis] - p[axis]);
    const y = previous.y + (p.y - previous.y) * t;
    const lateral = previous[across] + (p[across] - previous[across]) * t;
    if (Math.abs(y - hoop.boardY) <= hoop.boardHeight / 2 + radius && Math.abs(lateral - hoop[across]) <= hoop.boardWidth / 2 + radius) {
      p[axis] = front; v[axis] = -v[axis] * .5;
    }
  }
  const dx = p.x - hoop.x, dz = p.z - hoop.z, radial = Math.hypot(dx, dz);
  if (radial < 1e-6) return;
  const nx = dx - dx / radial * hoop.radius, ny = p.y - hoop.y, nz = dz - dz / radial * hoop.radius;
  const distance = Math.hypot(nx, ny, nz), contact = radius + hoop.tube;
  if (distance >= contact || distance < 1e-6) return;
  const x = nx / distance, y = ny / distance, z = nz / distance;
  p.x += x * (contact - distance); p.y += y * (contact - distance); p.z += z * (contact - distance);
  const into = v.x * x + v.y * y + v.z * z;
  if (into < 0) { v.x -= 1.45 * into * x; v.y -= 1.45 * into * y; v.z -= 1.45 * into * z; }
}

// Two soft dips, then restore the user's light state. No rapid strobe.
export function celebrationLight(elapsed, reduced = false) {
  if (reduced || elapsed < 0 || elapsed >= 1.4) return null;
  return .35 + .65 * Math.pow(Math.cos(elapsed / 1.4 * Math.PI * 2), 2);
}
