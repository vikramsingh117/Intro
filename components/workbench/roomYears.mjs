// Defines the shared chapter contract used by the monitor timeline and physical room.
// Asset URLs can be added per chapter as period-specific models replace the temporary geometry.
export const ROOM_YEARS = [
  { year: '2021', month: 2, label: 'College room', objects: ['monitor', 'window', 'notebook', 'desk-lamp', 'drawer'], props: [], assets: [] },
  { year: '2025', month: 56, label: 'Graduation room', objects: ['monitor', 'window', 'notebook', 'desk-lamp', 'drawer', 'radio'], props: ['work-build-holder'], assets: [] },
  { year: '2026', month: 60, label: 'Current room', objects: ['monitor', 'photo', 'window', 'notebook', 'paper-pile', 'upliance', 'desk-lamp', 'radio', 'ceiling-light', 'drawer', 'glasses-blur', 'glasses-pixel', 'glasses-crayon', 'glasses-sketch'], props: ['current-room'], assets: [] },
];

export const DEFAULT_ROOM_YEAR = '2026';

export function roomYearFor(year) {
  return ROOM_YEARS.find(chapter => chapter.year === String(year)) || ROOM_YEARS.at(-1);
}

export function roomYearIndex(year) {
  const index = ROOM_YEARS.findIndex(chapter => chapter.year === String(year));
  return index < 0 ? ROOM_YEARS.length - 1 : index;
}

export function roomHasObject(year, id) {
  return roomYearFor(year).objects.includes(id);
}
