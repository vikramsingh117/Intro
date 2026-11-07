// Skip removed leaves in either direction; stay put when none remain.
export function nextNotebookPage(page, direction, tornPages, count) {
  for (let next = page + direction; next >= 0 && next < count; next += direction) {
    if (!tornPages.includes(next)) return next;
  }
  return page;
}

export function notebookTurnLeaves(from, to) {
  return Array.from({ length: Math.abs(to - from) }, (_, i) => Math.min(from, to) + i);
}

// Stable, distinct tears: varying strip width, coarse notches and fine fibres.
export function tornEdgeWidth(page, v) {
  return .065 + (page % 4) * .014
    + Math.sin(v * (17 + page % 5) + page * 2.3) * .022
    + Math.sin(v * 93 + page * 5.7) * .009;
}

// The back of right-hand leaf N is left-hand page N+1. Removing that leaf
// exposes the last surviving page underneath, including consecutive tears.
export function visibleLeftPage(page, tornPages) {
  while (page > 0 && tornPages.includes(page - 1)) page -= 1;
  return page;
}

// Open the rip down the binding, leaving a ragged strip behind. Work in the
// page's local XY plane; positive Z lifts the peeled paper above the notebook.
export function deformTearingPage(geometry, progress, page = 0) {
  const position = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    const u = uv.getX(i), v = uv.getY(i);
    const released = Math.max(0, Math.min(1, (progress * 1.25 - (1 - v)) * 5));
    const edge = tornEdgeWidth(page, v);
    const x = -.55 + u * 1.1 + (1 - u) * edge * released;
    const pull = released * progress;
    position.setXYZ(i, x + pull * .28, (v - .5) * 1.55 + pull * .08,
      pull * (.12 + .3 * u) + Math.sin(u * Math.PI) * pull * .12);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals(); geometry.computeBoundingSphere(); geometry.computeBoundingBox();
}
