let journeyModule;

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
}
