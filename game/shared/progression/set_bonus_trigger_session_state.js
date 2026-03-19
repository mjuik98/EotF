import { applyPlayerMaxHpGrowthState } from '../state/player_state_commands.js';

export function applySetBonusSessionState(gs, normalizedTrigger) {
  if (normalizedTrigger === 'combat_start') {
    gs._machineSet2EnergyUsed = 0;
    gs._machineSet3DamageBonus = 0;
    gs._judgementSetCardCount = 0;
    gs._titanUsed = false;
    gs._moonSetReviveUsed = false;
    gs._sanctuarySet2Applied = false;
    gs._sanctuarySet2Bonus = 0;
    gs._grailNextBonus = 0;
  }

  if (normalizedTrigger === 'combat_end') {
    if (gs._sanctuarySet2Applied && gs._sanctuarySet2Bonus > 0) {
      applyPlayerMaxHpGrowthState(gs, -gs._sanctuarySet2Bonus);
    }
    gs._sanctuarySet2Applied = false;
    gs._sanctuarySet2Bonus = 0;
    gs._machineSet2EnergyUsed = 0;
    gs._machineSet3DamageBonus = 0;
    gs._judgementSetCardCount = 0;
    gs._moonSetReviveUsed = false;
  }
}
