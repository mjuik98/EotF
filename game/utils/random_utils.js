export const RandomUtils = {
  resolveRandomFn(source = null) {
    if (typeof source === 'function') return source;
    if (typeof source?.randomFn === 'function') return source.randomFn;
    if (typeof source?.random === 'function') return source.random;
    return Math.random;
  },
  pickRandomIndex(length, source = null) {
    const size = Math.max(0, Math.floor(Number(length) || 0));
    if (size < 1) return -1;
    const randomFn = this.resolveRandomFn(source);
    return Math.min(size - 1, Math.floor(randomFn() * size));
  },
  pickRandomItem(items, source = null) {
    if (!Array.isArray(items) || items.length < 1) return null;
    const index = this.pickRandomIndex(items.length, source);
    return index >= 0 ? (items[index] ?? null) : null;
  },
  shuffleArray(arr, source = null) {
    if (!Array.isArray(arr)) return arr;
    const randomFn = this.resolveRandomFn(source);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.min(i, Math.floor(randomFn() * (i + 1)));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
};
