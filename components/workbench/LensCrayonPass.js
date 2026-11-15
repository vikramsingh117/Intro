import { Vector2, Vector3 } from 'three';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass';

// Reuse the beauty, depth and normal buffers from Three's pixel pass, but draw
// them as layered pastel wax strokes instead of square pixels.
export default class LensCrayonPass extends RenderPixelatedPass {
  constructor(scene, camera, options) {
    super(2, scene, camera, options);
    const material = this.pixelatedMaterial;
    material.uniforms.tOriginal = { value: null };
    material.uniforms.lensSize = { value: new Vector2(.4, .46) };
    material.uniforms.lensOffset = { value: .21 };
    material.uniforms.lensCenterY = { value: .5 };
    material.uniforms.lensOpacity = { value: 1 };
    material.uniforms.contrastLow = { value: .1 };
    material.uniforms.contrastHigh = { value: .86 };
    material.uniforms.saturation = { value: 1.72 };
    material.uniforms.paletteSteps = { value: 8 };
    material.uniforms.pastelAmount = { value: .14 };
    material.uniforms.strokeAmount = { value: .18 };
    material.uniforms.grainAmount = { value: .12 };
    material.uniforms.grainColor = { value: new Vector3(1, .72, .62) };
    material.uniforms.outlineDarkness = { value: .9 };
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
      uniform float saturation;
      uniform float paletteSteps;
      uniform float pastelAmount;
      uniform float strokeAmount;
      uniform float grainAmount;
      uniform vec3 grainColor;
      uniform float outlineDarkness;
      varying vec2 vUv;

      float hash21(vec2 point) {
        point = fract(point * vec2(123.34, 345.45));
        point += dot(point, point + 34.345);
        return fract(point.x * point.y);
      }

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
        return smoothstep(0.006, 0.018, diff);
      }

      float normalEdgeIndicator(vec3 normal) {
        float diff = 0.0;
        diff += 1.0 - dot(normal, getNormal(1, 0));
        diff += 1.0 - dot(normal, getNormal(-1, 0));
        diff += 1.0 - dot(normal, getNormal(0, 1));
        diff += 1.0 - dot(normal, getNormal(0, -1));
        return smoothstep(0.12, 0.55, diff);
      }

      float lensMask(vec2 center) {
        vec2 point = abs((vUv - center) / (lensSize * 0.5));
        return (1.0 - smoothstep(0.96, 1.0, length(point))) * lensOpacity;
      }

      void main() {
        vec4 original = texture2D(tOriginal, vUv);
        vec3 source = texture2D(tDiffuse, vUv).rgb;
        // Preserve the scene color, but separate it into bold, high-contrast
        // crayon pigments without adding a cream paper wash.
        vec3 contrasted = smoothstep(vec3(contrastLow), vec3(contrastHigh), source);
        float contrastedLuminance = dot(contrasted, vec3(0.299, 0.587, 0.114));
        vec3 saturated = mix(vec3(contrastedLuminance), contrasted, saturation);
        vec3 palette = floor(clamp(saturated, 0.0, 1.0) * paletteSteps + 0.5) / paletteSteps;
        vec3 crayon = mix(palette, vec3(0.96), pastelAmount);

        // Two clean, imperfect pastel stroke directions. Noise varies their
        // phase without adding a separate light or dark grain layer.
        vec2 fragment = gl_FragCoord.xy;
        float grain = hash21(floor(fragment * 0.7));
        float strokeA = smoothstep(0.28, 0.82, sin(dot(fragment, vec2(0.72, 0.31)) + grain * 2.8) * 0.5 + 0.5);
        float strokeB = smoothstep(0.35, 0.86, sin(dot(fragment, vec2(-0.37, 0.64)) + grain * 3.5) * 0.5 + 0.5);
        float strokePattern = strokeA * 0.62 + strokeB * 0.38;
        crayon *= 1.0 - strokePattern * strokeAmount * 0.12;
        crayon = mix(crayon, grainColor, strokePattern * grainAmount);

        // Geometry-aware charcoal lines preserve the scene's 2.5D form.
        float depth = getDepth(0, 0);
        vec3 normal = getNormal(0, 0);
        float edge = max(
          depthEdgeIndicator(depth) * depthEdgeStrength,
          normalEdgeIndicator(normal) * normalEdgeStrength
        );
        crayon = mix(crayon, vec3(0.035, 0.032, 0.03), clamp(edge * outlineDarkness, 0.0, 0.95));

        float mask = max(
          lensMask(vec2(0.5 - lensOffset, lensCenterY)),
          lensMask(vec2(0.5 + lensOffset, lensCenterY))
        );
        gl_FragColor = vec4(mix(original.rgb, crayon, mask), original.a);
      }
    `;
    material.needsUpdate = true;
  }

  setLensLayout(width, height, mobile) {
    const frameWidth = Math.min(width * (mobile ? .98 : .94), 1200);
    const lensWidth = frameWidth * .47;
    const lensHeight = lensWidth / (mobile ? .85 : 1.2);
    const border = mobile ? 6 : 9;
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
    uniforms.saturation.value=settings.saturation;
    uniforms.paletteSteps.value=settings.paletteSteps;
    uniforms.pastelAmount.value=settings.pastelAmount;
    uniforms.strokeAmount.value=settings.strokeAmount;
    uniforms.grainAmount.value=settings.grainAmount;
    uniforms.grainColor.value.set(settings.grainR,settings.grainG,settings.grainB);
    uniforms.outlineDarkness.value=settings.outlineDarkness;
    this.depthEdgeStrength=settings.depthOutline;
    this.normalEdgeStrength=settings.normalOutline;
  }

  render(renderer, writeBuffer, readBuffer) {
    this.pixelatedMaterial.uniforms.tOriginal.value = readBuffer.texture;
    super.render(renderer, writeBuffer, readBuffer);
  }
}
