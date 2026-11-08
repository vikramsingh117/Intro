function matrixChanged(matrix, saved) {
  let changed = false;
  for (let i = 0; i < 16; i++) {
    if (saved[i] !== matrix.elements[i]) changed = true;
    saved[i] = matrix.elements[i];
  }
  return changed;
}

// Compare caster transforms rather than invalidating on every scene render.
// Non-casting animation (notably the hanging shade and rope) leaves the cached
// stationary-light maps alone. Geometry versions cover the notebook's tear.
export function createStationaryShadowCache({ motionInterval = 0 } = {}) {
  const casters = new Map(), lights = new Map();
  let frame = 0, time = 0;
  return {
    update(scene, delta = 1 / 60) {
      frame++; time += Math.max(0, delta);
      let pending = false;
      let dirty = false;
      scene.updateMatrixWorld();
      scene.traverseVisible(object => {
        if (object.isLight && object.userData.cacheStationaryShadow && object.shadow) {
          let saved = lights.get(object);
          if (!saved) {
            saved = { matrix: new Float64Array(16), target: new Float64Array(16), pending: false, lastRefresh: -Infinity };
            lights.set(object, saved);
          }
          saved.frame = frame;
        }
        if (!object.castShadow || !object.geometry) return;
        let saved = casters.get(object);
        if (!saved) {
          saved = { matrix: new Float64Array(16) };
          casters.set(object, saved); dirty = true;
        }
        saved.frame = frame;
        if (matrixChanged(object.matrixWorld, saved.matrix)) dirty = true;
        const geometry = object.geometry;
        const positionVersion = geometry.attributes.position?.version;
        const indexVersion = geometry.index?.version;
        const instanceVersion = object.instanceMatrix?.version;
        if (saved.geometry !== geometry || saved.positionVersion !== positionVersion ||
            saved.indexVersion !== indexVersion || saved.instanceVersion !== instanceVersion ||
            saved.material !== object.material) dirty = true;
        saved.geometry = geometry; saved.positionVersion = positionVersion;
        saved.indexVersion = indexVersion; saved.instanceVersion = instanceVersion;
        saved.material = object.material;
      });
      for (const [object, saved] of casters) {
        if (saved.frame !== frame) { casters.delete(object); dirty = true; }
      }
      for (const [light, saved] of lights) {
        if (saved.frame !== frame) { lights.delete(light); continue; }
        let lightChanged = matrixChanged(light.matrixWorld, saved.matrix);
        if (light.target) {
          light.target.updateWorldMatrix(true, false);
          if (matrixChanged(light.target.matrixWorld, saved.target)) lightChanged = true;
        }
        if (saved.castShadow !== light.castShadow) lightChanged = true;
        saved.castShadow = light.castShadow;
        light.shadow.autoUpdate = false;
        const moving = dirty || lightChanged;
        saved.pending ||= moving;
        // Reuse maps between motion samples; always render the final settled pose.
        // Brightness pulses do not change shadow geometry and need no new map.
        if (!light.shadow.map || (saved.pending && (!moving || time - saved.lastRefresh >= motionInterval))) {
          light.shadow.needsUpdate = true;
          saved.lastRefresh = time; saved.pending = false;
        }
        pending ||= saved.pending;
      }
      return pending;
    },
    dispose() {
      for (const light of lights.keys()) { light.shadow.autoUpdate = true; light.shadow.needsUpdate = true; }
      casters.clear(); lights.clear();
    },
  };
}
