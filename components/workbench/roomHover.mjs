import { Box3, Matrix4, Vector3 } from 'three';

export function isRoomHover(event, captured = false) {
  return event.type === 'pointermove' && event.buttons === 0 && event.pointerType !== 'touch' && !captured;
}

// Reuse world bounds for picking and outlining. Animation can move descendants
// without moving the root, so watch their transforms and deformed geometry too.
export function createRoomBounds(root) {
  const box = new Box3();
  const saved = new Map();
  function update() {
    root.updateWorldMatrix(true, true);
    let changed = false, count = 0;
    root.traverse(object => {
      count++;
      let previous = saved.get(object);
      if (!previous) {
        previous = { matrix: new Matrix4() };
        saved.set(object, previous);
        changed = true;
      }
      if (!previous.matrix.equals(object.matrixWorld)) changed = true;
      previous.matrix.copy(object.matrixWorld);
      const geometry = object.geometry, version = geometry?.attributes.position?.version;
      if (previous.geometry !== geometry || previous.version !== version) {
        geometry?.computeBoundingBox();
        changed = true;
      }
      previous.geometry = geometry;
      previous.version = version;
    });
    if (count !== saved.size) {
      const current = new Set();
      root.traverse(object => current.add(object));
      for (const object of saved.keys()) if (!current.has(object)) saved.delete(object);
      changed = true;
    }
    if (changed) box.setFromObject(root);
    return changed;
  }
  update();
  return { box, update };
}

export function installObjectHover(root, box) {
  const original = root.raycast;
  const point = new Vector3();
  const raycast = function(raycaster, hits) {
    if (!raycaster.roomHoverOnly) return original.call(this, raycaster, hits);
    if (raycaster.ray.intersectBox(box, point)) {
      const distance = raycaster.ray.origin.distanceTo(point);
      if (distance >= raycaster.near && distance <= raycaster.far) {
        hits.push({ distance, point: point.clone(), object: this });
      }
    }
    // Three supports stopping recursive picking here. Child click/drag targets
    // remain untouched because only unpressed pointer moves use this path.
    return false;
  };
  root.raycast = raycast;
  return () => { if (root.raycast === raycast) root.raycast = original; };
}
