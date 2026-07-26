/** Short, sufficiently-unique id for locally-created records (profiles, session events). Not cryptographic. */
export function makeId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}-${time}-${random}`;
}
