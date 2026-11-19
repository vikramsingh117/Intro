// Keeps projector dragging consistent between the physical room and its pixel representation.
export function resistedPull(start, delta) {
  const safeStart = Math.max(-.995, Math.min(.995, Number(start) || 0));
  return Math.tanh(Math.atanh(safeStart) + delta);
}

export const CENTERED_PROJECTOR = { powered: true, pull: { x: 0, y: 0 } };
