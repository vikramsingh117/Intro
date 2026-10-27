// BSON dates represent instants in UTC. Companion strings make IST visible in MongoDB.
export function indianTime(date = new Date()) {
  return new Date(date.getTime() + 330 * 60 * 1000).toISOString().replace('Z', '+05:30');
}

export function databaseTime(field, date = new Date()) {
  return { [field]: date, [`${field}IST`]: indianTime(date) };
}
