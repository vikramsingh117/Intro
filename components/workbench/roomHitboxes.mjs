import { Matrix4, Mesh, Ray, Vector3 } from 'three';

// Keep each mesh as the event target so its existing click/drag handlers still
// bubble through the same parents. Only replace expensive triangle picking.
export function installRoomHitboxes(root) {
  const restore = [];
  root.traverse(mesh => {
    if (!mesh.isMesh || mesh.userData.precisePicking || mesh.isSkinnedMesh || mesh.isInstancedMesh || mesh.morphTargetInfluences ||
        mesh.raycast !== Mesh.prototype.raycast || (mesh.geometry?.attributes.position?.count || 0) < 128) return;
    const geometry = mesh.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bounds = geometry.boundingBox.clone();
    const inverse = new Matrix4(), ray = new Ray(), point = new Vector3();
    const original = mesh.raycast;
    const hitbox = function(raycaster, intersections) {
      inverse.copy(this.matrixWorld).invert();
      ray.copy(raycaster.ray).applyMatrix4(inverse);
      if (!ray.intersectBox(bounds, point)) return;
      point.applyMatrix4(this.matrixWorld);
      const distance = raycaster.ray.origin.distanceTo(point);
      if (distance < raycaster.near || distance > raycaster.far) return;
      intersections.push({ distance, point: point.clone(), object: this });
    };
    mesh.raycast = hitbox;
    restore.push(() => { if (mesh.raycast === hitbox) mesh.raycast = original; });
  });
  return () => restore.forEach(reset => reset());
}
