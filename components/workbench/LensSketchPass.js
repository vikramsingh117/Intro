// Extends Three.js's depth-and-normal pass with monochrome graphite shading clipped to both glasses lenses.
// The scene composer supplies responsive lens geometry and live tuning while the original frame remains outside it.
import { Vector2 } from 'three';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass';

export default class LensSketchPass extends RenderPixelatedPass {
  constructor(scene, camera, options) {
    super(2, scene, camera, options);
    const material = this.pixelatedMaterial;
    material.uniforms.tOriginal = { value: null };
    material.uniforms.lensSize = { value: new Vector2(.4, .46) };
    material.uniforms.lensOffset = { value: .21 };
    material.uniforms.lensCenterY = { value: .5 };
    material.uniforms.lensOpacity = { value: 1 };
    material.uniforms.contrastLow = { value: .055 };
    material.uniforms.contrastHigh = { value: .93 };
    material.uniforms.greyLevel = { value: .34 };
    material.uniforms.whiteLevel = { value: 1 };
    material.uniforms.hatchAmount = { value: .72 };
    material.uniforms.noiseAmount = { value: .015 };
    material.uniforms.imageOutlineStrength = { value: .52 };
    material.uniforms.outlineShade = { value: .25 };
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
      uniform float contrastLow;
      uniform float contrastHigh;
      uniform float greyLevel;
      uniform float whiteLevel;
      uniform float hatchAmount;
      uniform float noiseAmount;
      uniform float imageOutlineStrength;
      uniform float outlineShade;
      varying vec2 vUv;

      float hash21(vec2 point) {
        point = fract(point * vec2(123.34, 456.21));
        point += dot(point, point + 45.32);
        return fract(point.x * point.y);
      }

      float getDepth(int x, int y) {
        return texture2D(tDepth, vUv + vec2(x, y) * resolution.zw).r;
      }

      vec3 getNormal(int x, int y) {
        return texture2D(tNormal, vUv + vec2(x, y) * resolution.zw).rgb * 2.0 - 1.0;
      }

      float depthOutline(float depth) {
        float difference = 0.0;
        difference += abs(getDepth(1, 0) - depth);
        difference += abs(getDepth(-1, 0) - depth);
        difference += abs(getDepth(0, 1) - depth);
        difference += abs(getDepth(0, -1) - depth);
        return smoothstep(0.0035, 0.018, difference);
      }

      float normalOutline(vec3 normal) {
        float difference = 0.0;
        difference += 1.0 - dot(normal, getNormal(1, 0));
        difference += 1.0 - dot(normal, getNormal(-1, 0));
        difference += 1.0 - dot(normal, getNormal(0, 1));
        difference += 1.0 - dot(normal, getNormal(0, -1));
        return smoothstep(0.08, 0.48, difference);
      }

      float luminanceAt(int x, int y) {
        vec3 color = texture2D(tDiffuse, vUv + vec2(x, y) * resolution.zw).rgb;
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      float imageOutline() {
        float horizontal =
          -luminanceAt(-1, -1) - 2.0 * luminanceAt(-1, 0) - luminanceAt(-1, 1)
          + luminanceAt(1, -1) + 2.0 * luminanceAt(1, 0) + luminanceAt(1, 1);
        float vertical =
          -luminanceAt(-1, -1) - 2.0 * luminanceAt(0, -1) - luminanceAt(1, -1)
          + luminanceAt(-1, 1) + 2.0 * luminanceAt(0, 1) + luminanceAt(1, 1);
        return smoothstep(0.12, 0.55, length(vec2(horizontal, vertical)));
      }

      float lensMask(vec2 center) {
        vec2 point = abs((vUv - center) / (lensSize * 0.5));
        float angularShape = pow(point.x, 4.0) + pow(point.y, 4.0);
        return (1.0 - smoothstep(0.91, 1.0, angularShape)) * lensOpacity;
      }

      void main() {
        vec4 original = texture2D(tOriginal, vUv);
        vec3 source = texture2D(tDiffuse, vUv).rgb;
        float luminance = dot(source, vec3(0.299, 0.587, 0.114));
        float tone = smoothstep(contrastLow, contrastHigh, luminance);

        float depth = getDepth(0, 0);
        vec3 normal = getNormal(0, 0);
        float outline = max(
          depthOutline(depth) * depthEdgeStrength,
          normalOutline(normal) * normalEdgeStrength
        );
        outline = max(outline, imageOutline() * imageOutlineStrength);

        // Graphite hatching lives primarily in the shadows and follows two
        // opposing stroke directions so flat faces retain readable form.
        vec2 fragment = gl_FragCoord.xy;
        float noise = hash21(floor(fragment * 0.55));
        float hatchA = smoothstep(0.35, 0.78, sin(dot(fragment, vec2(0.55, 0.24)) + noise * 2.0) * 0.5 + 0.5);
        float hatchB = smoothstep(0.42, 0.82, sin(dot(fragment, vec2(-0.28, 0.48)) + noise * 2.7) * 0.5 + 0.5);
        float shadow = 1.0 - tone;
        float graphite = shadow * (0.08 + hatchA * 0.12 + hatchB * shadow * 0.1);
        float shadedTone = clamp(tone - graphite * hatchAmount - noise * noiseAmount, 0.0, 1.0);
        float sketchTone = mix(greyLevel, whiteLevel, shadedTone);
        vec3 sketch = vec3(sketchTone);
        sketch = mix(sketch, vec3(outlineShade), clamp(outline, 0.0, 0.9));

        float mask = max(
          lensMask(vec2(0.5 - lensOffset, lensCenterY)),
          lensMask(vec2(0.5 + lensOffset, lensCenterY))
        );
        gl_FragColor = vec4(mix(original.rgb, sketch, mask), original.a);
      }
    `;
    material.needsUpdate = true;
  }

  setLensLayout(width, height, mobile) {
    const frameWidth = Math.min(width * (mobile ? .98 : .94), 1200);
    const lensWidth = frameWidth * .47;
    const lensHeight = lensWidth / (mobile ? .85 : 1.2);
    const border = mobile ? 5 : 7;
    this.pixelatedMaterial.uniforms.lensSize.value.set((lensWidth - border * 2) / width, (lensHeight - border * 2) / height);
    this.pixelatedMaterial.uniforms.lensOffset.value = (lensWidth * .5 + frameWidth * .03) / width;
  }

  setLensCenterY(value) {
    this.pixelatedMaterial.uniforms.lensCenterY.value=value;
  }

  setLensOpacity(value) {
    this.pixelatedMaterial.uniforms.lensOpacity.value=value;
  }

  updateSettings(settings) {
    if (!settings) return;
    const uniforms=this.pixelatedMaterial.uniforms;
    uniforms.contrastLow.value=settings.contrastLow;
    uniforms.contrastHigh.value=settings.contrastHigh;
    uniforms.greyLevel.value=settings.greyLevel;
    uniforms.whiteLevel.value=settings.whiteLevel;
    uniforms.hatchAmount.value=settings.hatchAmount;
    uniforms.noiseAmount.value=settings.noiseAmount;
    uniforms.imageOutlineStrength.value=settings.imageOutline;
    uniforms.outlineShade.value=settings.outlineShade;
    this.depthEdgeStrength=settings.depthOutline;
    this.normalEdgeStrength=settings.normalOutline;
  }

  render(renderer, writeBuffer, readBuffer) {
    this.pixelatedMaterial.uniforms.tOriginal.value = readBuffer.texture;
    super.render(renderer, writeBuffer, readBuffer);
  }
}
