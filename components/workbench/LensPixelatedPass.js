import { Vector2 } from 'three';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass';

// Three's RenderPixelatedPass provides the low-resolution beauty, depth and
// normal buffers. This variant composites that result over the incoming frame
// only where the two glasses lenses sit on screen.
export default class LensPixelatedPass extends RenderPixelatedPass {
  constructor(pixelSize, scene, camera, options) {
    super(pixelSize, scene, camera, options);
    const material = this.pixelatedMaterial;
    material.uniforms.tOriginal = { value: null };
    material.uniforms.lensSize = { value: new Vector2(.35, .4) };
    material.uniforms.lensOffset = { value: .19 };
    material.uniforms.lensCenterY = { value: .5 };
    material.uniforms.lensOpacity = { value: 1 };
    material.fragmentShader = /* glsl */`
      uniform sampler2D tOriginal;
      uniform sampler2D tDiffuse;
      uniform sampler2D tDepth;
      uniform sampler2D tNormal;
      uniform vec4 resolution;
      uniform vec2 lensSize;
      uniform float lensOffset;
      uniform float lensCenterY;
      uniform float lensOpacity;
      uniform float normalEdgeStrength;
      uniform float depthEdgeStrength;
      varying vec2 vUv;

      float getDepth(int x, int y) {
        return texture2D(tDepth, vUv + vec2(x, y) * resolution.zw).r;
      }

      vec3 getNormal(int x, int y) {
        return texture2D(tNormal, vUv + vec2(x, y) * resolution.zw).rgb * 2.0 - 1.0;
      }

      float depthEdgeIndicator(float depth) {
        float diff = 0.0;
        diff += clamp(getDepth(1, 0) - depth, 0.0, 1.0);
        diff += clamp(getDepth(-1, 0) - depth, 0.0, 1.0);
        diff += clamp(getDepth(0, 1) - depth, 0.0, 1.0);
        diff += clamp(getDepth(0, -1) - depth, 0.0, 1.0);
        return floor(smoothstep(0.01, 0.02, diff) * 2.0) / 2.0;
      }

      float neighborNormalEdgeIndicator(int x, int y, float depth, vec3 normal) {
        float depthDiff = getDepth(x, y) - depth;
        vec3 neighborNormal = getNormal(x, y);
        float normalDiff = dot(normal - neighborNormal, vec3(1.0));
        float normalIndicator = clamp(smoothstep(-0.01, 0.01, normalDiff), 0.0, 1.0);
        float depthIndicator = clamp(sign(depthDiff * 0.25 + 0.0025), 0.0, 1.0);
        return (1.0 - dot(normal, neighborNormal)) * depthIndicator * normalIndicator;
      }

      float normalEdgeIndicator(float depth, vec3 normal) {
        float indicator = 0.0;
        indicator += neighborNormalEdgeIndicator(0, -1, depth, normal);
        indicator += neighborNormalEdgeIndicator(0, 1, depth, normal);
        indicator += neighborNormalEdgeIndicator(-1, 0, depth, normal);
        indicator += neighborNormalEdgeIndicator(1, 0, depth, normal);
        return step(0.1, indicator);
      }

      float lensMask(vec2 center) {
        vec2 point = abs((vUv - center) / (lensSize * 0.5));
        vec2 steppedPoint = floor(point * 12.0 + 0.5) / 12.0;
        float blockShape = pow(steppedPoint.x, 6.0) + pow(steppedPoint.y, 6.0);
        return (1.0 - smoothstep(0.9, 1.0, blockShape)) * lensOpacity;
      }

      void main() {
        vec4 original = texture2D(tOriginal, vUv);
        vec4 pixelColor = texture2D(tDiffuse, vUv);
        float depth = getDepth(0, 0);
        vec3 normal = getNormal(0, 0);
        float depthEdge = depthEdgeStrength > 0.0 ? depthEdgeIndicator(depth) : 0.0;
        float normalEdge = normalEdgeStrength > 0.0 ? normalEdgeIndicator(depth, normal) : 0.0;
        float edgeLight = depthEdge > 0.0
          ? 1.0 - depthEdgeStrength * depthEdge
          : 1.0 + normalEdgeStrength * normalEdge;
        pixelColor.rgb *= edgeLight;

        float mask = max(
          lensMask(vec2(0.5 - lensOffset, lensCenterY)),
          lensMask(vec2(0.5 + lensOffset, lensCenterY))
        );
        gl_FragColor = mix(original, pixelColor, mask);
      }
    `;
    material.needsUpdate = true;
  }

  setLensLayout(width, height, mobile) {
    const frameWidth = Math.min(width * (mobile ? .98 : .94), 1200);
    const lensWidth = frameWidth * .47;
    const lensHeight = lensWidth / (mobile ? .85 : 1.2);
    const border = mobile ? 6 : 10;
    this.pixelatedMaterial.uniforms.lensSize.value.set((lensWidth - border * 2) / width, (lensHeight - border * 2) / height);
    this.pixelatedMaterial.uniforms.lensOffset.value = (lensWidth * .5 + frameWidth * .03) / width;
  }

  setLensCenterY(value) {
    this.pixelatedMaterial.uniforms.lensCenterY.value=value;
  }

  setLensOpacity(value) {
    this.pixelatedMaterial.uniforms.lensOpacity.value=value;
  }

  render(renderer, writeBuffer, readBuffer) {
    this.pixelatedMaterial.uniforms.tOriginal.value = readBuffer.texture;
    super.render(renderer, writeBuffer, readBuffer);
  }
}
