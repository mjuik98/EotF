export function selectCurrentScreen(gs) {
  return gs?.currentScreen ?? null;
}

export function selectPlayerState(gs) {
  return gs?.player || null;
}

export function selectCombatState(gs) {
  return gs?.combat || null;
}

export function selectMetaState(gs) {
  return gs?.meta || null;
}

export function selectStatsState(gs) {
  return gs?.stats || null;
}
