export function clampNonNegative(value) {
  return Math.max(0, Number(value) || 0);
}

export function selectPlayerState(gs) {
  return gs?.player || null;
}
