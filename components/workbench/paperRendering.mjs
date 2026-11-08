const noRaycast = () => null;

export function preparePaperMeshes(model, aiming) {
  model.traverse(node => {
    if (!node.isMesh) return;
    // A held ball follows every pointer move. Keep it out of room shadow maps
    // so dragging does not redraw all stationary-light shadows each frame.
    node.castShadow = !aiming;
    node.receiveShadow = !aiming;
    node.raycast = noRaycast;
  });
}
