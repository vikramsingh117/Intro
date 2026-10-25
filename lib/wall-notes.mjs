export const NOTE_LIMIT = 200;
export const validId = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function validNote(value) {
  return value && typeof value.text === 'string' && value.text.trim().length > 0 && value.text.length <= 240 &&
    Number.isFinite(value.x) && value.x >= -2.25 && value.x <= 6 &&
    Number.isFinite(value.y) && value.y >= .9 && value.y <= 4.7;
}
export function publicNote(note, ownerHash) {
  return { id: note._id, text: note.text, x: note.x, y: note.y, createdAt: note.createdAt, updatedAt: note.updatedAt, canEdit: note.ownerHash === ownerHash };
}
