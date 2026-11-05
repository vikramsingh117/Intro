// Shared screen position keeps the 3D ball and pointer pickup area aligned.
export const PAPER_AIM_Y = .68;
export const PAPER_AIM_DISTANCE = 2.3;

export function paperAimOffsetY(fov) {
  const viewHeight = 2 * PAPER_AIM_DISTANCE * Math.tan(fov * Math.PI / 360);
  return (.5 - PAPER_AIM_Y) * viewHeight;
}
