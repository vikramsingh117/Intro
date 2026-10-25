# Monitor asset
“Computer Screen” by Kenney. Public Domain (CC0).
Source: https://poly.pizza/m/V5Qo141OcB
License: https://creativecommons.org/publicdomain/zero/1.0/
Downloaded 2026-10-23. Original GLB retained; custom screen overlay added in code.

## Desk lamp

“Desk Lamp” by Grab3D, CC0-1.0.
Source: https://grab3d.com/models/furniture/desk-lamp/
Original GLB retained; scaled and positioned in the scene, with runtime bulb emission and lighting toggles.
See `desk-lamp-LICENSE.txt`.

## Keyboard

“Keyboard” by thethieme, CC BY 4.0.
Source: https://sketchfab.com/3d-models/keyboard-cc7e7ed38d9a469ea499893295bc767a
Author: https://sketchfab.com/thethieme
License: https://creativecommons.org/licenses/by/4.0/
Original glTF, binary, and textures retained in `keyboard/`; scaled and positioned in the scene. Static prop, without interactions. Original license: `keyboard/license.txt`. Visitor-facing credit appears below the preview.

## Subway

“Lowpoly Berlin U-bahn Station” by n-malmberg, CC BY 4.0.
Source: https://sketchfab.com/3d-models/lowpoly-berlin-u-bahn-station-2a02d3f2eccf4cd29bbaa1348787395e
Author: https://sketchfab.com/n-malmberg
License: https://creativecommons.org/licenses/by/4.0/
Original files and license retained in `subway/`. `runtime.gltf` adapts legacy specular/glossiness materials to approximate metallic/roughness materials for Three.js: diffuse maps retained, metallic=0, roughness=0.8. Model centered and scaled at runtime. Loaded behind the room window in the shared 3D scene; the camera moves to the exterior view.

## Chair

“Rustic chair” by Araon, CC BY 4.0.
Source: https://sketchfab.com/3d-models/rustic-chair-77afa26a76614fc2b8ed845024af0b58
Author: https://sketchfab.com/araon
License: https://creativecommons.org/licenses/by/4.0/
Original download preserved in `chair/`. `runtime.gltf` approximates legacy specular/glossiness materials with metallic=0, roughness=0.8 and the original diffuse, normal and occlusion maps. Scaled, centered, and rotated to face the desk.

## Night city — current window exterior

“Low Poly Night City Building Skyline” by 99.Miles, CC BY 4.0.
Source: https://sketchfab.com/3d-models/low-poly-night-city-building-skyline-b0035b8713b048bb8ddf311ee67c28c8
Author: https://sketchfab.com/99.Miles
License: https://creativecommons.org/licenses/by/4.0/
Original glTF, binary, textures, and license retained in `city/`. Geometry normalized to a 20-unit maximum dimension and centered, then positioned/scaled/rotated using scene settings. Original PBR materials preserved; emission adjustable. Replaces the subway at runtime; subway files retained for reference. Runtime uses `city/optimized.gltf`: 1536px WebP color and emissive maps (quality 80/85), with 512px lossless WebP normal, roughness/metallic and clearcoat maps. Runtime city payload is approximately 1.47 MB versus the original 10 MB. Resized normals are renormalized. Rebuild using `scripts/optimize-city.cjs` with Sharp available. Original assets remain unchanged.

## Radio

“Iskra-Unitra RM 312 Radio” by thecalcman, Sketchfab Standard License.
Source: https://sketchfab.com/3d-models/iskra-unitra-rm-312-radio-384de87761704f848127e8b4460c97e3
Author: https://sketchfab.com/calcman
License: https://sketchfab.com/licenses
User-provided download retained in `radio/`, including its license. Original geometry and textures; scaled and placed in front of the lamp as a decorative prop.

## Aircraft

“Lowpoly AC-130” by SIpriv, CC BY 4.0.
Source: https://sketchfab.com/3d-models/lowpoly-ac-130-63238efa8edd4c5ca518cf8fa7f49747
Author: https://sketchfab.com/S1Priv
License: https://creativecommons.org/licenses/by/4.0/
Original files retained in `plane/`. Normalized to a 0.975-unit wingspan, positioned above the city, and animated on a custom flyby path at 0.18 scene units per second; faint emissive fill and navigation lights added. Bundled landing animation is not played. Motion pauses outside the city view, when hidden/offscreen, and for reduced motion.

### Rhyzome Plant
- Source: https://sketchfab.com/3d-models/rhyzome-plant-7191a1b935ac452987866573713e4da5
- Author: Blizzy (https://sketchfab.com/jeffbas)
- License: CC BY 4.0; original license retained in plant/license.txt.
- Original geometry and textures; normalized and positioned on the floor to the right of the desk.

### Bar Ceiling Light - 2048px²
- Source: https://sketchfab.com/3d-models/bar-ceiling-light-2048px2-2ba27702aabe4d37822956a2b7bf43d8
- Author: Mark Peters (https://sketchfab.com/mark-peters)
- License: CC BY 4.0; original license retained in ceiling-light/license.txt.
- Scaled above the plant, with extended suspension, modified bulb emission/transmission and toggleable warm lighting.

## Optimized room textures

Plant, ceiling light, chair, radio, and keyboard load their own `optimized.gltf` manifests. Color textures use WebP quality 85 at up to 1024px, with full-quality alpha; data maps use lossless WebP at up to 512px. Normal vectors are renormalized after resizing. Geometry and material settings are unchanged, and original assets and licenses remain available. Run `scripts/optimize-room.cjs` with Sharp available to regenerate these textures. Both preloading and scene components use the optimized manifests.
