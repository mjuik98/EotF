export function beginPlayerTurnUseCase({
  gs,
  classMechanics,
  preserveGuardianShield,
  beforeStartPlayerTurn,
  startPlayerTurn,
  syncCombatEnergy,
  onTurnStart,
  presentPlayerTurnReady,
} = {}) {
  if (!gs?.combat?.active) return false;

  preserveGuardianShield?.(gs);
  beforeStartPlayerTurn?.();
  startPlayerTurn?.(gs);
  syncCombatEnergy?.();
  onTurnStart?.(gs);

  const classMech = classMechanics?.[gs.player?.class];
  if (typeof classMech?.onTurnStart === 'function') {
    classMech.onTurnStart(gs);
  }

  presentPlayerTurnReady?.();
  return true;
}
