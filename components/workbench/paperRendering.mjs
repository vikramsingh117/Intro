import { Box3, Vector3 } from 'three';
import { PAPER_RADIUS } from './paperInventoryState.mjs';

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

export function createPaperModel(asset, aiming) {
  const clone = asset.clone(true);
  const bounds = new Box3().setFromObject(clone);
  const center = bounds.getCenter(new Vector3()), size = bounds.getSize(new Vector3());
  const scale = PAPER_RADIUS * 2 / Math.max(size.x, size.y, size.z);
  clone.scale.multiplyScalar(scale);
  clone.position.copy(center).multiplyScalar(-scale);
  preparePaperMeshes(clone, aiming);
  return clone;
}
