import {
  applyPlayerMaxHpGrowthState,
  changePlayerEnergyState,
  clearPlayerStatusState,
} from '../state/player_state_commands.js';

export function applySetBonusDamageRules(gs, counts, normalizedTrigger, data) {
  if (counts.judgement >= 2 && normalizedTrigger === 'combat_start') {
    gs.addEcho?.(15, { name: '심판의 불꽃 세트(2)', type: 'set' });
  }
  if (counts.judgement >= 3 && normalizedTrigger === 'card_play') {
    gs._judgementSetCardCount = (gs._judgementSetCardCount || 0) + 1;
    if (gs._judgementSetCardCount % 3 === 0) {
      changePlayerEnergyState(gs, 1);
      gs.addLog?.('🔥 심판의 불꽃 세트(3): 에너지 회복', 'item');
    }
  }
  if (counts.judgement >= 5 && normalizedTrigger === 'enemy_kill') {
    gs.heal?.(5, { name: '심판의 불꽃 세트(5)', type: 'set' });
    gs.addShield?.(10, { name: '심판의 불꽃 세트(5)', type: 'set' });
  }

  if (counts.shadow_venom >= 2 && normalizedTrigger === 'poison_damage') {
    if (typeof data === 'number') return data + 2;
    if (data && typeof data.amount === 'number') return { ...data, amount: data.amount + 2 };
  }
  if (counts.shadow_venom >= 3 && normalizedTrigger === 'enemy_kill' && gs._lastKillByPoison) {
    gs.drawCards?.(1, { name: '그림자 독사 세트(3)', type: 'set' });
  }
  if (counts.shadow_venom >= 5 && normalizedTrigger === 'poison_damage') {
    const amount = typeof data === 'number' ? data : (data?.amount || 0);
    if (amount > 0) gs.addShield?.(2, { name: '그림자 독사 세트(5)', type: 'set' });
  }

  if (counts.sanctuary >= 2 && normalizedTrigger === 'combat_start' && !gs._sanctuarySet2Applied) {
    gs._sanctuarySet2Applied = true;
    gs._sanctuarySet2Bonus = 10;
    applyPlayerMaxHpGrowthState(gs, 10);
  }
  if (counts.sanctuary >= 3 && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
    const currentHp = gs.player.hp || 0;
    const maxHp = gs.player.maxHp || 0;
    const overflow = Math.max(0, currentHp + data - maxHp);
    if (overflow > 0) {
      gs.addShield?.(overflow, { name: '성역의 은총 세트(3)', type: 'set' });
    }
  }
  if (counts.sanctuary >= 5 && normalizedTrigger === 'turn_start') {
    gs.heal?.(5, { name: '성역의 은총 세트(5)', type: 'set' });
    if (gs.player.statusEffects) {
      const debuffs = Object.keys(gs.player.statusEffects).filter((key) => gs.player.statusEffects[key] > 0);
      if (debuffs.length > 0) {
        const target = debuffs[Math.floor(Math.random() * debuffs.length)];
        clearPlayerStatusState(gs, target);
        gs.addLog?.(`✨ 성역의 은총 세트(5): ${target} 제거!`, 'item');
      }
    }
  }

  return undefined;
}
