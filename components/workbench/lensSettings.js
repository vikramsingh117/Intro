// Defines the production shader tuning for the crayon and graphite glasses effects.
// WorkbenchScene passes these values into the matching post-processing classes through their update interfaces.
export const DEFAULT_LENS_SETTINGS = {
  crayon: {
    contrastLow: 0, contrastHigh: .5, saturation: 1.5, paletteSteps: 15,
    pastelAmount: 0, strokeAmount: .49, grainAmount: 0,
    grainR: 0, grainG: 0, grainB: 0,
    depthOutline: .87, normalOutline: .61, outlineDarkness: .68,
  },
  sketch: {
    contrastLow: .12, contrastHigh: .58, greyLevel: .02, whiteLevel: .77,
    hatchAmount: .64, noiseAmount: .075, imageOutline: .4,
    depthOutline: 1.5, normalOutline: .29, outlineShade: .15,
  },
};
