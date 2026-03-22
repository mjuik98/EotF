const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp']);
const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const COMMIT_KEYS = new Set(['Enter', ' ']);

export function getItemDetailNavIndex(key, currentIndex, totalCount) {
  const count = Number(totalCount) || 0;
  if (count <= 0 || currentIndex < 0) return -1;

  if (PREV_KEYS.has(key)) return Math.max(0, currentIndex - 1);
  if (NEXT_KEYS.has(key)) return Math.min(count - 1, currentIndex + 1);
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return -1;
}

export function isItemDetailCommitKey(key) {
  return COMMIT_KEYS.has(key);
}
