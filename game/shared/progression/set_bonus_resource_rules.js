import { changePlayerEnergyState } from '../state/player_state_commands.js';
import { getAmountValue, withAmountValue } from './set_bonus_helpers.js';

export function applySetBonusResourceRules(gs, counts, normalizedTrigger, data) {
  const dealDamageAmount = normalizedTrigger === 'deal_damage' ? getAmountValue(data) : null;

  if (counts.abyssal_set >= 3) {
    if (normalizedTrigger === 'deal_damage' && dealDamageAmount !== null) {
      return withAmountValue(data, Math.floor(dealDamageAmount * 1.15));
    }
    if (normalizedTrigger === 'turn_start') {
      gs.addEcho?.(15, { name: '심연의 삼위일체 세트(3)', type: 'set' });
    }
  }

  if (counts.void_set >= 2 && normalizedTrigger === 'card_play' && Number(data?.cost) === 0) {
    gs.addEcho?.(5, { name: '공허의 삼위일체 세트(2)', type: 'set' });
  }

  if (counts.ancient_set >= 4 && normalizedTrigger === 'combat_start') {
    gs.drawCards?.(1, { name: '고대인의 유산 세트(4)', type: 'set' });
  }

  if (counts.machine_set >= 2) {
    if (normalizedTrigger === 'card_exhaust' && (gs._machineSet2EnergyUsed || 0) < 4) {
      gs._machineSet2EnergyUsed = (gs._machineSet2EnergyUsed || 0) + 1;
      changePlayerEnergyState(gs, 1);
      gs.addLog?.('⚙️ 기계의 심장 세트(2): 에너지 +1', 'item');
    }
    if (normalizedTrigger === 'turn_start') {
      gs._machineSet3DamageBonus = counts.machine_set >= 3 ? (gs.player.exhausted?.length || 0) * 5 : 0;
    }
  }
  if (counts.machine_set >= 3 && normalizedTrigger === 'deal_damage' && (gs._machineSet3DamageBonus || 0) > 0 && dealDamageAmount !== null) {
    return withAmountValue(data, dealDamageAmount + gs._machineSet3DamageBonus);
  }

  return undefined;
}
