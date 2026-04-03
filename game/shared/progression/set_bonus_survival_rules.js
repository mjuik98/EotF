import {
  getAmountValue,
  hasLegacySetTier,
  hasSetTier,
  resolveTargetIdx,
  withAmountValue,
} from './set_bonus_helpers.js';
import {
  changePlayerEnergyState,
  setPlayerHpState,
} from '../state/player_state_commands.js';

export function applySetBonusSurvivalRules(gs, counts, normalizedTrigger, data) {
  const dealDamageAmount = normalizedTrigger === 'deal_damage' ? getAmountValue(data) : null;

  if (counts.void_set >= 3 && normalizedTrigger === 'deal_damage' && dealDamageAmount !== null) {
    const targetIdx = resolveTargetIdx(gs, data?.targetIdx);
    if (targetIdx >= 0 && (gs.combat?.enemies?.[targetIdx]?.statusEffects?.weakened || 0) > 0) {
      return withAmountValue(data, Math.floor(dealDamageAmount * 1.15));
    }
  }

  if (counts.ancient_set >= 5 && normalizedTrigger === 'deal_damage' && dealDamageAmount !== null) {
    return withAmountValue(data, dealDamageAmount + 6);
  }

  if (hasSetTier(gs, counts, 'serpents_gaze', 2) && normalizedTrigger === 'poison_damage' && data?.amount > 0 && Math.random() < 0.1) {
    const aliveIndices = (gs.combat?.enemies || [])
      .map((enemy, idx) => (enemy.hp > 0 ? idx : -1))
      .filter((idx) => idx !== -1);
    if (aliveIndices.length > 1) {
      const others = aliveIndices.filter((idx) => idx !== data.targetIdx);
      const targetIdx = others[Math.floor(Math.random() * others.length)];
      if (Number.isInteger(targetIdx)) {
        gs.applyEnemyStatus?.('poisoned', 2, targetIdx, { name: '독사의 시선 세트(2)', type: 'set' });
        gs.addLog?.('🐍 독사의 갈무리: 독 전이!', 'echo');
      }
    }
  }
  if (hasSetTier(gs, counts, 'serpents_gaze', 3) && normalizedTrigger === 'deal_damage' && dealDamageAmount !== null) {
    const targetIdx = resolveTargetIdx(gs, data?.targetIdx);
    if (targetIdx >= 0 && (gs.combat?.enemies?.[targetIdx]?.statusEffects?.poisoned || 0) >= 10) {
      return withAmountValue(data, Math.floor(dealDamageAmount * 1.25));
    }
  }

  if (hasSetTier(gs, counts, 'holy_grail', 2) && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
    const currentHp = gs.player.hp || 0;
    const maxHp = gs.player.maxHp || 0;
    const overflow = Math.max(0, currentHp + data - maxHp);
    if (overflow > 0) {
      gs.addShield?.(overflow, { name: '생명의 성배 세트(2)', type: 'set' });
      return Math.max(0, maxHp - currentHp);
    }
  }
  if (hasSetTier(gs, counts, 'holy_grail', 3) && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
    gs._grailNextBonus = (gs._grailNextBonus || 0) + 4;
  }
  if (hasSetTier(gs, counts, 'holy_grail', 3) && normalizedTrigger === 'deal_damage' && dealDamageAmount !== null && (gs._grailNextBonus || 0) > 0) {
    const bonus = gs._grailNextBonus;
    gs._grailNextBonus = 0;
    return withAmountValue(data, dealDamageAmount + bonus);
  }

  if (hasSetTier(gs, counts, 'titans_endurance', 2) && normalizedTrigger === 'deal_damage' && dealDamageAmount !== null && (gs.player.hp || 0) >= (gs.player.maxHp || 0) * 0.8) {
    return withAmountValue(data, dealDamageAmount + 5);
  }
  if (hasSetTier(gs, counts, 'titans_endurance', 3) && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data >= (gs.player.hp || 0) && !gs._titanUsed) {
    gs._titanUsed = true;
    setPlayerHpState(gs, 1);
    gs.addLog?.('🛡️ 거인의 불사: 치명적 피해 방지!', 'echo');
    return true;
  }

  if (hasLegacySetTier(gs, 'iron_fortress', 3) && normalizedTrigger === 'deal_damage' && dealDamageAmount !== null) {
    return withAmountValue(data, dealDamageAmount + Math.floor((gs.player.shield || 0) * 0.2));
  }

  if (counts.iron_fortress >= 2 && normalizedTrigger === 'deal_damage' && dealDamageAmount !== null) {
    let result = dealDamageAmount + Math.floor((gs.player.shield || 0) * 0.2);
    const isReflect = gs._isReflectDamage || (typeof data === 'object' && data?.isReflect);
    if (counts.iron_fortress >= 3 && isReflect) {
      result += 5;
    }
    return withAmountValue(data, result);
  }
  if (
    normalizedTrigger === 'turn_start'
    && (
      (counts.iron_fortress >= 5 && (gs.player.shield || 0) >= 40)
      || (hasLegacySetTier(gs, 'iron_fortress', 2) && (gs.player.shield || 0) > 0 && Math.random() < 0.25)
    )
  ) {
    changePlayerEnergyState(gs, 1);
    gs.addLog?.(
      counts.iron_fortress >= 5
        ? '🛡️ 철옹성 세트(5): 에너지 +1'
        : '🛡️ 철옹성 세트(구 2): 에너지 +1',
      'item',
    );
  }

  return undefined;
}
