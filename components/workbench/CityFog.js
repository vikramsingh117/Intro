import { useMemo } from 'react';
import { DoubleSide } from 'three';

const vertexShader = `
  varying vec2 cloudUv;
  varying float worldZ;
  void main() {
    cloudUv = uv;
    worldZ = (modelMatrix * vec4(position, 1.0)).z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = `
  varying vec2 cloudUv;
  varying float worldZ;
  uniform float layer;
  uniform float density;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }
  void main() {
    // The exterior window glass is at world Z -3.33. Clip behind it,
    // independent of city rotation, scale, and the cloud spread controls.
    if (worldZ >= -3.5) discard;
    float exteriorFade = 1.0 - smoothstep(-5.5, -3.5, worldZ);
    vec2 p = cloudUv * 2.0 - 1.0;
    float edge = 1.0 - smoothstep(0.5, 1.0, length(p));
    vec2 q = p * 12.0 + vec2(layer * 1.7, layer * 0.9);
    float cloud = noise(q) * 0.6 + noise(q * 2.1) * 0.28 + noise(q * 4.3) * 0.12;
    // Dense lower layers seal the base; the upper layers break into softer billows.
    float body = mix(0.95, smoothstep(0.15, 0.8, cloud), layer);
    float alpha = exteriorFade * edge * body * density * mix(0.85, 0.4, layer);
    vec3 color = mix(vec3(0.045, 0.075, 0.115), vec3(0.22, 0.29, 0.36), cloud * 0.6 + layer * 0.4);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function CityFog({ base, settings }) {
  const density = settings.fogDensity ?? 1;
  const layers = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    layer: { value: i / 17 }, density: { value: density },
  })), [density]);
  const height = settings.fogHeight ?? 2;
  const thickness = settings.fogThickness ?? 4;
  const spread = settings.fogSpread ?? 80;
  if (density === 0) return null;
  return <group name="city-base-clouds">
    {layers.map((uniforms, i) => <mesh key={i}
      position={[0, base + height - thickness + (i / 17) * thickness, 0]}
      rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <planeGeometry args={[spread, spread]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}
        transparent depthWrite={false} side={DoubleSide} />
    </mesh>)}
  </group>;
}
