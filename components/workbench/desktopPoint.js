// Converts viewport pointer coordinates into the monitor desktop's transformed local coordinate system.
// Desktop window dragging and resizing use the perspective-correct point after undoing the element's CSS matrix.
export default function localPoint(element, event) {
  const parent = element.offsetParent;
  const bounds = parent.getBoundingClientRect();
  const matrix = new DOMMatrix(getComputedStyle(element).transform).inverse();
  const point = matrix.transformPoint(new DOMPoint(event.clientX-bounds.left-parent.clientLeft, event.clientY-bounds.top-parent.clientTop, 0, 1));
  return { x:point.x/point.w, y:point.y/point.w };
}
