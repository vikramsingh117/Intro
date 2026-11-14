// Shares the About Me code import and BUILD / WORK image preloads across callers.
// WorkbenchScene starts it in the background, while PortfolioApps reuses the cached module.
let journeyModule;
let journeyAssets;
const JOURNEY_ASSETS = [
  '/images/journey/github.svg',
  '/images/journey/leetcode.svg',
  '/images/journey/cribble.png',
  '/images/journey/office-solutions.png',
];

function preloadJourneyAssets() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!journeyAssets) {
    journeyAssets = Promise.all(JOURNEY_ASSETS.map(url => new Promise(resolve => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = url;
    })));
  }
  return journeyAssets;
}

// Share the monitor-entry prefetch with the app's dynamic import.
export function loadAboutJourney() {
  if (!journeyModule) {
    journeyModule = import('./AboutJourney').catch(error => {
      journeyModule = undefined;
      throw error;
    });
  }
  return journeyModule;
}

export function preloadAboutJourney() {
  // A failed background request must not interrupt entry into the desktop.
  void loadAboutJourney().catch(() => {});
  void preloadJourneyAssets();
}
