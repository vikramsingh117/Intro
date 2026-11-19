// Defines responsive wall-note placement bounds and helpers for clamping pointers into the valid region.
// Mobile bounds account for the basketball hoop so StickyNotes never places paper through the rim or backboard.
import { MOBILE_HOOP } from './basketball.mjs';

export const NOTE_HALF_SIZE = .36;
export const NOTE_WALL_Z = -3.075;
export const NOTE_EDITOR_Z = NOTE_WALL_Z + .01;
export const DESKTOP_NOTE_BOUNDS = Object.freeze({ minX: -2.25, maxX: 6, minY: .9, maxY: 4.7 });
// Keep the entire paper square, not only its center, clear of the rim/backboard.
const MOBILE_BOUNDS = Object.freeze({ ...DESKTOP_NOTE_BOUNDS,
  minX: Math.ceil((MOBILE_HOOP.x + Math.max(MOBILE_HOOP.radius, MOBILE_HOOP.boardWidth / 2) + NOTE_HALF_SIZE + .15) * 10) / 10 });
export const noteBoundsForWidth = width => width <= 760 ? MOBILE_BOUNDS : DESKTOP_NOTE_BOUNDS;
export function clampNotePosition(x, y, bounds) {
  return { x: Math.max(bounds.minX, Math.min(bounds.maxX, x)), y: Math.max(bounds.minY, Math.min(bounds.maxY, y)) };
}
export function notePlacementRect(bounds) {
  return { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2,
    width: bounds.maxX - bounds.minX + NOTE_HALF_SIZE * 2, height: bounds.maxY - bounds.minY + NOTE_HALF_SIZE * 2 };
}
