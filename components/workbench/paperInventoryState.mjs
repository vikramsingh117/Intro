export const STARTING_PAPER_COUNT = 3;
export const PAPER_RADIUS = .24;
export const PAPER_PILE_ORIGIN = [-1.15, -1.5 + PAPER_RADIUS, -.62];

export function initialPaperInventory() {
  return Array.from({ length: STARTING_PAPER_COUNT }, (_, index) => ({ id: index + 1, page: null }));
}

// Only consume the ball actually thrown, so a repeated release cannot skip one.
export function consumePaper(inventory, id) {
  return inventory[0]?.id === id ? inventory.slice(1) : inventory;
}

export function pilePosition(index) {
  const layer = Math.floor(index / 6), slot = index % 6;
  return [(slot % 3 - 1) * .46 + (layer % 2) * .035, layer * .39, (Math.floor(slot / 3) - .5) * .45];
}

export function refillPage(pageCount, instructionIndex, tornPages) {
  if (!tornPages.includes(instructionIndex)) return instructionIndex;
  for (let i = instructionIndex + 1; i < pageCount; i++) if (!tornPages.includes(i)) return i;
  for (let i = 0; i < instructionIndex; i++) if (!tornPages.includes(i)) return i;
  return null;
}
