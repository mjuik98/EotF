import {
  hasLegacySetTier,
  hasSetTier,
  normalizeTrigger,
  resolveTargetIdx,
} from './set_bonus_helpers.js';
import {
  applyPlayerMaxHpGrowthState,
  changePlayerEnergyState,
  clearPlayerStatusState,
  setPlayerHpState,
} from '../state/player_state_commands.js';

export function triggerSetBonusEffects(gs, counts, trigger, data) {
  const normalizedTrigger = normalizeTrigger(trigger);

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

  if (counts.void_set >= 3) {
    if (normalizedTrigger === 'deal_damage' && typeof data === 'number') {
      return Math.floor(data * 1.15);
    }
    if (normalizedTrigger === 'turn_start') {
      gs.addEcho?.(15, { name: '심연의 삼위일체 세트(3)', type: 'set' });
    }
  }

  if (counts.echo_set >= 3 && normalizedTrigger === 'turn_start') {
    gs.addEcho?.(20, { name: '반향의 삼각 세트(3)', type: 'set' });
  }

  if (counts.blood_set >= 3 && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data > 0 && Math.random() < 0.2) {
    gs.addLog?.('💉 혈맹의 완성: 피해 무효!', 'echo');
    return true;
  }

  if (counts.storm_set >= 2 && normalizedTrigger === 'card_play') {
    gs.addEcho?.(4, { name: '폭풍의 세 검 세트(2)', type: 'set' });
  }
  if (counts.storm_set >= 3 && normalizedTrigger === 'deal_damage' && (gs.player.echoChain || 0) >= 3 && typeof data === 'number') {
    return Math.floor(data * 1.1);
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
  if (counts.machine_set >= 3 && normalizedTrigger === 'deal_damage' && (gs._machineSet3DamageBonus || 0) > 0 && typeof data === 'number') {
    return data + gs._machineSet3DamageBonus;
  }

  if (counts.moon_set >= 2 && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
    gs.addShield?.(2, { name: '달의 신비 세트(2)', type: 'set' });
  }
  if (counts.moon_set >= 3 && normalizedTrigger === 'turn_start' && (gs.player.shield || 0) >= 15) {
    gs.heal?.(3, { name: '달의 신비 세트(3)', type: 'set' });
  }
  if (counts.moon_set >= 5 && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data >= (gs.player.hp || 0) && !gs._moonSetReviveUsed) {
    gs._moonSetReviveUsed = true;
    setPlayerHpState(gs, 20);
    gs.addLog?.('🌙 달의 신비: 치명적 피해 방지 및 체력 회복!', 'echo');
    return true;
  }

  if (counts.dusk_set >= 2 && normalizedTrigger === 'deal_damage' && typeof data === 'number') {
    const targetIdx = resolveTargetIdx(gs);
    if (targetIdx < 0) return undefined;
    const target = gs.combat?.enemies?.[targetIdx];
    if ((target?.statusEffects?.poisoned || 0) > 0) {
      return data + 8;
    }
  }

  if (counts.plague_coven >= 2 && normalizedTrigger === 'poison_damage') {
    const amount = typeof data === 'number' ? data : data?.amount;
    if (amount > 0) gs.addShield?.(1, { name: '역병의 결사 세트(2)', type: 'set' });
  }
  if (counts.plague_coven >= 3 && normalizedTrigger === 'poison_damage') {
    if (typeof data === 'number') return Math.floor(data * 1.2);
    if (data && typeof data.amount === 'number') return { ...data, amount: Math.floor(data.amount * 1.2) };
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
  if (hasSetTier(gs, counts, 'serpents_gaze', 3) && normalizedTrigger === 'deal_damage' && typeof data === 'number') {
    const targetIdx = resolveTargetIdx(gs);
    if (targetIdx >= 0 && (gs.combat?.enemies?.[targetIdx]?.statusEffects?.poisoned || 0) >= 10) {
      return Math.floor(data * 1.25);
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
  if (hasSetTier(gs, counts, 'holy_grail', 3) && normalizedTrigger === 'deal_damage' && typeof data === 'number' && (gs._grailNextBonus || 0) > 0) {
    const bonus = gs._grailNextBonus;
    gs._grailNextBonus = 0;
    return data + bonus;
  }

  if (hasSetTier(gs, counts, 'titans_endurance', 2) && normalizedTrigger === 'deal_damage' && typeof data === 'number' && (gs.player.hp || 0) >= (gs.player.maxHp || 0) * 0.8) {
    return data + 5;
  }
  if (hasSetTier(gs, counts, 'titans_endurance', 3) && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data >= (gs.player.hp || 0) && !gs._titanUsed) {
    gs._titanUsed = true;
    setPlayerHpState(gs, 1);
    gs.addLog?.('🛡️ 거인의 불사: 치명적 피해 방지!', 'echo');
    return true;
  }

  if (hasLegacySetTier(gs, 'iron_fortress', 3) && normalizedTrigger === 'deal_damage' && typeof data === 'number') {
    return data + Math.floor((gs.player.shield || 0) * 0.2);
  }

  if (counts.iron_fortress >= 2 && normalizedTrigger === 'deal_damage' && typeof data === 'number') {
    let result = data + Math.floor((gs.player.shield || 0) * 0.2);
    const isReflect = gs._isReflectDamage || (typeof data === 'object' && data?.isReflect);
    if (counts.iron_fortress >= 3 && isReflect) {
      result += 5;
    }
    return result;
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
