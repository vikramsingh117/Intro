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
Original files and license retained in `subway/`. `runtime.gltf` adapts legacy specular/glossiness materials to approximate metallic/roughness materials for Three.js: diffuse maps retained, metallic=0, roughness=0.8. Model centered and scaled at runtime. Legacy asset, retained for reference but not loaded; the current exterior is the night city.

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
User-provided download retained in `radio/`, including its license. Geometry preserved; optimized textures loaded at runtime. Placed in front of the lamp, with click-to-play/pause user-provided audio.

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
- Original geometry and textures; normalized and positioned on the floor to the left of the desk at [-6.65, -4.8, 0.2].

### Bar Ceiling Light - 2048px²
- Source: https://sketchfab.com/3d-models/bar-ceiling-light-2048px2-2ba27702aabe4d37822956a2b7bf43d8
- Author: Mark Peters (https://sketchfab.com/mark-peters)
- License: CC BY 4.0; original license retained in ceiling-light/license.txt.
- Suspended above the right side of the desk, with modified bulb emission/transmission and toggleable warm lighting. Fixture lowered into the room framing: anchor Y=7.2, ceiling Y=24. The cord and ceiling cap remain connected.

## Optimized room textures

Plant, ceiling light, chair, radio, and keyboard load their own `optimized.gltf` manifests. Color textures use WebP quality 85 at up to 1024px, with full-quality alpha; data maps use lossless WebP at up to 512px. Normal vectors are renormalized after resizing. Geometry and material settings are unchanged, and original assets and licenses remain available. Run `scripts/optimize-room.cjs` with Sharp available to regenerate these textures. Both preloading and scene components use the optimized manifests.

## Upliance appliance

User-provided Autodesk OBJ/MTL: `Upliance Gen ll Assembly v29`, with originals retained in Downloads (not shipped with the website). `upliance/interactive.glb` preserves the assembly and supplied material colors, approximates metal roughness, removes unused UVs, combines compatible parts, simplifies geometry, and quantizes vertex attributes. Approximately 1,946,197 triangles reduced to 186,504; runtime interactive GLB is 4,491,216 bytes. Named body, lid assembly, light guides and screen nodes are retained for interaction. No textures or external decoder required. Rendered as a hover-activated appliance on the stool to the right of the desk; final position [6.61, -1.36, -0.17], rotation 0°, scale 0.79.

Rebuild with `scripts/optimize-upliance.mjs INPUT.obj TOOL_DIRECTORY`; the temporary tool directory needs `@gltf-transform/core`, `@gltf-transform/functions`, `@gltf-transform/extensions`, and `meshoptimizer`. Original OBJ and matching MTL must be alongside one another.

## Pascal soft toy

“Pascal” by Nordban, CC BY-NC 4.0.
Source: https://sketchfab.com/3d-models/pascal-bc8582ae72e24ae6a30816ea452f50a0
Author: https://sketchfab.com/Nordban
License: https://creativecommons.org/licenses/by-nc/4.0/
Original files and license retained in `pascal/`. Runtime uses `pascal/optimized.gltf`, with WebP color textures at up to 1024px and lossless data maps at up to 512px. Normal vectors renormalized after resizing. Approximately 2.92 MB reduced to 1.03 MB; geometry preserved. Static toy placed beside the desk lamp at [-4.02, -1.53, -1.11], rotation -31°, scale 1. Rebuild using `scripts/optimize-room.cjs pascal` with Sharp available.

## Wooden stool

“wooden stool” by diana_ver, CC BY 4.0.
Source: https://sketchfab.com/3d-models/wooden-stool-79847abac75a4211a4f072c45516fbea
Author: https://sketchfab.com/diana_ver
License: https://creativecommons.org/licenses/by/4.0/
Originals and license retained in `stool/`. Runtime `optimized.gltf` uses 1024px WebP color and 512px lossless WebP data maps, with renormalized normals. Payload reduced from 7.70 MB to 0.56 MB; original geometry preserved in the asset, with a runtime deformation to extend the legs 30% while retaining the seat size. Regenerate with `scripts/optimize-room.cjs stool` with Sharp available. Initial height is 2.4 scene units, before the 30% leg extension. Final position [6.53, -4.8, 0.13], rotation 0°, scale 1.12. Temporary placement controls have been removed.

The upliance lid opens and blue LEDs/display fade on together on hover, reversing on pointer exit; touch and pen tap to toggle. The original lid pieces move as one assembly around a presentation pivot. The SVG cooking screen is drawn from the supplied reference, not a live recipe or appliance backend. Runtime screen geometry follows the measured CAD panel plane. LED segments are instanced in one draw call. The former static `upliance/model.glb` is retained but no longer preloaded.
