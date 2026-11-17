// Connects pixel-room dragging to the mounted 3D ceiling rope without duplicating physics.
// The fixture publishes its displacement so SVG geometry and its hotspot follow the real simulation.
export const ceilingLightBridge = { api: null, x: 0, y: 0 };
