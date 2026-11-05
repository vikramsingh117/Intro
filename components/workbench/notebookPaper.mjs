// The back of right-hand leaf N is left-hand page N+1. Removing that leaf
// exposes the last surviving page underneath, including consecutive tears.
export function visibleLeftPage(page, tornPages) {
  while (page > 0 && tornPages.includes(page - 1)) page -= 1;
  return page;
}

// Open the rip down the binding, leaving a ragged strip behind. Work in the
// page's local XY plane; positive Z lifts the peeled paper above the notebook.
export function deformTearingPage(geometry, progress) {
  const position = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    const u = uv.getX(i), v = uv.getY(i);
    const released = Math.max(0, Math.min(1, (progress * 1.25 - (1 - v)) * 5));
    const edge = .07 + Math.sin((1 - v) * 24 * 7.3) * .018;
    const x = -.55 + u * 1.1 + (1 - u) * edge * released;
    const pull = released * progress;
    position.setXYZ(i, x + pull * .28, (v - .5) * 1.55 + pull * .08,
      pull * (.12 + .3 * u) + Math.sin(u * Math.PI) * pull * .12);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals(); geometry.computeBoundingSphere(); geometry.computeBoundingBox();
}
