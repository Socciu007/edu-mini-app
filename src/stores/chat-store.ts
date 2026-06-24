// Temporary stub for Task 14. Task 16 will replace this with the full Zustand store.
const cache: Map<string, unknown> = new Map();
export function rememberQuestion(q: unknown) {
  cache.set((q as { id: string }).id, q);
}
export function getRememberedQuestion(id: string) {
  return cache.get(id);
}
