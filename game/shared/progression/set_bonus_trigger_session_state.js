export function applySetBonusSessionState(gs, normalizedTrigger) {
  if (normalizedTrigger === 'combat_start') {
    gs._machineSet2EnergyUsed = 0;
    gs._machineSet3DamageBonus = 0;
    gs._titanUsed = false;
    gs._grailNextBonus = 0;
  }

  if (normalizedTrigger === 'combat_end') {
    gs._machineSet2EnergyUsed = 0;
    gs._machineSet3DamageBonus = 0;
    gs._grailNextBonus = 0;
  }
}
