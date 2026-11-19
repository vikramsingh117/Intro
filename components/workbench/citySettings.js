// Centralizes the approved per-year city transform, camera framing, lighting, fog, and material tuning.
// The temporary editor resets to these values and copies the same shape used by the production room.
export const CITY_SETTINGS_BY_YEAR = {
  '2021': {
    x:-8,y:2.5,z:-13.7,scale:.85,heightScale:1,rotation:-58,tilt:0,
    // Continue through the window instead of hiding its frame during the camera move.
    cameraX:-3.85,cameraY:1.73,cameraZ:-3.7,
    targetX:-8,targetY:5.1,targetZ:-14,fov:29,
    exposure:.75,ambient:1.15,warm:69,cool:62,
    fogHeight:1.4,fogThickness:2.4,fogSpread:73,fogDensity:.65,
    shadows:.35,glow:.35,emissive:.5,
  },
  '2025': {
    x:-10.5,y:4,z:-12.6,scale:.95,heightScale:.95,rotation:-25,tilt:-.5,
    cameraX:-3.85,cameraY:2.63,cameraZ:-3.7,
    targetX:-8.1,targetY:4.7,targetZ:-14,fov:45,
    exposure:.8,ambient:1.4,warm:71,cool:62,
    fogHeight:1.8,fogThickness:2.2,fogSpread:72,fogDensity:.65,
    shadows:.3,glow:.8,emissive:3.1,
  },
  '2026': {
    x:-9.7,y:2.2,z:-13.7,scale:.85,heightScale:1,rotation:64,tilt:0,
    cameraX:-3.85,cameraY:2.63,cameraZ:-3.7,
    targetX:-8.1,targetY:4.7,targetZ:-14,fov:45,
    exposure:.8,ambient:1.4,warm:71,cool:62,
    fogHeight:1.6,fogThickness:2.4,fogSpread:73,fogDensity:.65,
    shadows:.3,glow:.7,emissive:1.2,
  },
};

export const DEFAULT_CITY_SETTINGS=CITY_SETTINGS_BY_YEAR['2026'];
