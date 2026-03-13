export function getPlayerHpPanelLevel(gs) {
  const hp = Math.max(0, Number(gs?.player?.hp) || 0);
  const maxHp = Math.max(1, Number(gs?.player?.maxHp) || 1);
  const ratio = hp / maxHp;
  if (ratio <= 0.2) return 'critical';
  if (ratio <= 0.4) return 'low';
  if (ratio <= 0.65) return 'mid';
  return 'safe';
}
