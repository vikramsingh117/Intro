// Editable 2D scene layout. Every value is in the shared 480 × 240 SVG coordinate space.
// Send or paste updated { x, y, width, height } entries to art-direct a year without changing SVG paths.
export const PIXEL_ITEM_BOUNDS = {
  window: { x: 49.6, y: 21, width: 116, height: 111 },
  'height-scale': { x: 464, y: 17, width: 10, height: 164 },
  desk: { x: 94, y: 165, width: 273, height: 62 },
  lamp: { x: 95, y: 126, width: 54, height: 47 },
  notebook: { x: 141, y: 153, width: 51, height: 24 },
  computer: { x: 215, y: 92, width: 96, height: 83 },
  projector: { x: 222, y: 0, width: 36, height: 28 },
  'work-projection': { x: 165, y: 38, width: 150, height: 98 },
  'letter-clock': { x: 215, y: 17, width: 54, height: 30 },
  'photo-frame': { x: 318, y: 104, width: 38, height: 48 },
  upliance: { x: 382, y: 121, width: 65, height: 104 },
  notes: { x: 313, y: 35, width: 36, height: 21 },
  plant: { x: 35, y: 108, width: 66, height: 120 },
  'ceiling-light': { x: 390, y: 0, width: 47, height: 37 },
  hoop: { x: 7, y: 38, width: 35, height: 35 },
  radio: { x: 99, y: 131, width: 48, height: 50 },
  glasses: { x: 315, y: 159, width: 28, height: 8 },
  paper: { x: 190, y: 161, width: 24, height: 8 },
  fireflies: { x: 60, y: 135, width: 30, height: 20 },
  chair: { x: 224, y: 187, width: 66, height: 50 },
};

export const PIXEL_ROOM_LAYOUTS = {
  '2021': {
    window: { x: 65, y: 17, width: 92, height: 111 },
    'height-scale': { x: 464, y: 17, width: 10, height: 164 },
    desk: { x: 94, y: 165, width: 273, height: 62 },
    lamp: { x: 121, y: 113, width: 54, height: 53 },
    notebook: { x: 156, y: 148, width: 51, height: 24 },
    computer: { x: 215, y: 92, width: 96, height: 83 },
    chair: { x: 224, y: 187, width: 66, height: 50 },
  },
  '2025': {
    window: { x: 65, y: 17, width: 92, height: 111 },
    'height-scale': { x: 464, y: 17, width: 10, height: 164 },
    desk: { x: 94, y: 165, width: 273, height: 62 },
    lamp: { x: 121, y: 113, width: 54, height: 53 },
    notebook: { x: 156, y: 148, width: 51, height: 24 },
    computer: { x: 215, y: 92, width: 96, height: 83 },
    projector: { x: 222, y: 0, width: 36, height: 28 },
    'work-projection': { x: 165, y: 38, width: 150, height: 98 },
    'letter-clock': { x: 154, y: 17, width: 39, height: 30 },
    plant: { x: 23, y: 108, width: 66, height: 120 },
    radio: { x: 105, y: 131, width: 48, height: 50 },
    chair: { x: 224, y: 187, width: 66, height: 50 },
  },
  '2026': {
    window: { x: 65, y: 17, width: 92, height: 111 },
    'height-scale': { x: 464, y: 17, width: 10, height: 164 },
    desk: { x: 94, y: 165, width: 273, height: 62 },
    lamp: { x: 121, y: 113, width: 54, height: 53 },
    notebook: { x: 156, y: 148, width: 51, height: 24 },
    computer: { x: 215, y: 92, width: 96, height: 83 },
    'photo-frame': { x: 318, y: 129, width: 26, height: 37 },
    upliance: { x: 369, y: 121, width: 65, height: 104 },
    notes: { x: 313, y: 35, width: 36, height: 21 },
    plant: { x: 23, y: 108, width: 66, height: 120 },
    'ceiling-light': { x: 390, y: 0, width: 47, height: 37 },
    hoop: { x: 8, y: 17, width: 54, height: 57 },
    radio: { x: 105, y: 131, width: 48, height: 50 },
    glasses: { x: 319, y: 165, width: 28, height: 8 },
    paper: { x: 207, y: 161, width: 24, height: 8 },
    fireflies: { x: 60, y: 135, width: 30, height: 20 },
    chair: { x: 224, y: 187, width: 66, height: 50 },
  },
};

export function pixelRoomYear(month) {
  return month >= 60 ? '2026' : month >= 48 ? '2025' : '2021';
}

export function pixelItemTransform(id, placement) {
  const bounds = PIXEL_ITEM_BOUNDS[id];
  if (!bounds || !placement) return null;
  const scaleX = placement.width / bounds.width;
  const scaleY = placement.height / bounds.height;
  return `translate(${placement.x} ${placement.y}) scale(${scaleX} ${scaleY}) translate(${-bounds.x} ${-bounds.y})`;
}

export function placePixelBox(box, id, placement) {
  const bounds = PIXEL_ITEM_BOUNDS[id];
  if (!bounds || !placement) return box;
  const scaleX = placement.width / bounds.width;
  const scaleY = placement.height / bounds.height;
  return [
    placement.x + (box[0] - bounds.x) * scaleX,
    placement.y + (box[1] - bounds.y) * scaleY,
    box[2] * scaleX,
    box[3] * scaleY,
  ];
}
