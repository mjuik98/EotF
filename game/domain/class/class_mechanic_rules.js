import { DATA } from '../../../data/game_data.js';
import {
  consumeHunterPendingMarkState,
  increaseBuffFieldState,
  incrementHunterHitCountState,
  incrementMageCastCounterState,
  incrementMageTraitDiscountState,
  refreshResonanceState,
  resetHunterHitCountState,
  resetHunterHitCountsState,
  resetMageCastCounterState,
  resetMageCombatState,
  setGuardianPreservedShieldState,
  setMageDiscountTargetState,
} from '../../shared/state/class_mechanic_state_commands.js';
import { LogUtils } from '../../utils/log_utils.js';

function getGS(gs) {
  return gs;
}

const UNBREAKABLE_WALL_STACK_UNIT = 99;

function getUnbreakableWallHits(buff) {
  const stacks = Number(buff?.stacks || 0);
  if (!Number.isFinite(stacks) || stacks <= 0) return 0;
  return Math.max(1, Math.floor(stacks / UNBREAKABLE_WALL_STACK_UNIT));
}

function getAliveEnemyIndexes(state) {
  return state.combat?.enemies
    ?.map((enemy, idx) => (enemy.hp > 0 ? idx : -1))
    .filter((idx) => idx !== -1) || [];
}

function grantPlayerShield(state, amount) {
  if (!state || amount <= 0) return null;
  if (typeof state.addShield === 'function') {
    return state.addShield(amount);
  }
  if (typeof state.dispatch === 'function') {
    const result = state.dispatch('player:shield', { amount });
    if (result !== undefined && result !== null) return result;
  }
  if (state.player) {
    state.player.shield = Math.max(0, Number(state.player.shield || 0) + Number(amount || 0));
    state.markDirty?.('hud');
    return { shieldAfter: state.player.shield };
  }
  return null;
}

function triggerUnbreakableWall(state, buffKey, buff, ratio) {
  if (!state || !buff || ratio <= 0) return;

  const shield = Number(state.player?.shield || 0);
  if (!Number.isFinite(shield) || shield <= 0) return;

  const damagePerHit = Math.floor(shield * ratio);
  if (damagePerHit <= 0) return;

  const hits = getUnbreakableWallHits(buff);
  if (hits <= 0) return;

  const label = buffKey === 'unbreakable_wall_plus'
    ? '불굴의 벽+'
    : '불굴의 벽';

  for (let i = 0; i < hits; i += 1) {
    const aliveEnemies = getAliveEnemyIndexes(state);
    if (!aliveEnemies.length) break;

    const targetIdx = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    const hitSuffix = hits > 1 ? ` (${i + 1}/${hits})` : '';
    state.addLog(
      LogUtils.formatEcho(`${label}${hitSuffix}: 적에게 ${damagePerHit} 피해!`),
      'echo',
    );
    state.dealDamage(damagePerHit, targetIdx, true);
  }
}

export const ClassMechanics = {
  swordsman: {
    onPlayCard(gs, { cardId }) {
      const state = getGS(gs);
      if (!state?.player?.buffs) return;
      const res = state.player.buffs.resonance;
      if (res) {
        const prev = Number(res.dmgBonus || 0);
        const next = Math.min(30, prev + 1);
        const delta = Math.max(0, next - prev);
        refreshResonanceState(state, delta);
      } else {
        refreshResonanceState(state, 1);
      }
      state.markDirty?.('hud');
      void cardId;
    },
    onMove(gs) {
      const state = getGS(gs);
      if (!state?.combat?.active) return;
      if (!state?.player?.buffs) return;
      const res = state.player.buffs.resonance;
      if (res) {
        const nextBonus = Math.min(30, Number(res.dmgBonus || 0) + 3);
        const delta = Math.max(0, nextBonus - Number(res.dmgBonus || 0));
        refreshResonanceState(state, delta);
      } else {
        refreshResonanceState(state, 3);
      }
    },
  },
  mage: {
    onCombatStart(gs) {
      const state = getGS(gs);
      if (!state?.player) return;
      resetMageCombatState(state);
    },
    onPlayCard(gs) {
      const state = getGS(gs);
      const player = state?.player;
      if (!state || !player) return;

      if (incrementMageCastCounterState(state) < 3) {
        state.markDirty?.('hud');
        return;
      }

      resetMageCastCounterState(state);
      const hand = Array.isArray(player.hand) ? player.hand : [];
      const dataCards = DATA?.cards || {};
      const candidates = hand.filter((id) => (dataCards[id]?.cost || 0) > 0);

      if (candidates.length === 0) {
        setMageDiscountTargetState(state, null);
        state.addLog(LogUtils.formatEcho('🔮 메아리: 할인 가능한 카드가 없습니다.'), 'echo');
        state.markDirty?.('hud');
        return;
      }

      const pickedId = candidates[Math.floor(Math.random() * candidates.length)];
      incrementMageTraitDiscountState(state, pickedId);
      setMageDiscountTargetState(state, pickedId);

      const cardName = dataCards[pickedId]?.name || pickedId;
      state.addLog(LogUtils.formatEcho(`🔮 메아리: ${cardName} 비용 -1`), 'echo');
      state.markDirty?.('hand');
      state.markDirty?.('hud');
    },
  },
  hunter: {
    onCombatStart(gs) {
      const state = getGS(gs);
      if (state.player) resetHunterHitCountsState(state);
    },
    onDealDamage(gs, damage, targetIdx) {
      const state = getGS(gs);
      const player = state?.player;
      if (!player || targetIdx === null) return damage;

      const pendingMark = Number(player._classMasteryHunterMarkPending || 0);
      if (pendingMark > 0 && Number(damage || 0) > 0 && targetIdx >= 0) {
        state.applyEnemyStatus?.('marked', pendingMark, targetIdx);
        consumeHunterPendingMarkState(state);
        state.addLog?.(LogUtils.formatEcho(`Hunter awakening: Mark ${pendingMark} applied.`), 'echo');
      }

      const hits = incrementHunterHitCountState(state, targetIdx);

      if (hits >= 5) {
        resetHunterHitCountState(state, targetIdx);
        state.addLog(LogUtils.formatEcho('🎯 정적 발동: 독 3턴 부여 + 카드 1장 드로우'), 'echo');
        state.applyEnemyStatus('poisoned', 3, targetIdx);
        state.drawCards?.(1);
      }
      return damage;
    },
  },
  paladin: {
    onTurnStart(gs) {
      const state = getGS(gs);
      const buffPlus = state?.getBuff?.('blessing_of_light_plus');
      const buffNormal = state?.getBuff?.('blessing_of_light');
      const activeBuff = buffPlus || buffNormal;
      const healAmount = Number(activeBuff?.healPerTurn || 0);

      if (healAmount > 0) {
        const sourceName = buffPlus ? '빛의 축복+' : '빛의 축복';
        state.heal(healAmount, { name: sourceName, type: 'card' });
      }
    },
    onHeal(gs, amount) {
      const state = getGS(gs);
      if (amount <= 0 || !state.combat?.enemies || state.combat.enemies.length === 0) return;

      const aliveEnemies = state.combat.enemies.map((e, idx) => (e.hp > 0 ? idx : -1)).filter((idx) => idx !== -1);
      if (aliveEnemies.length === 0) return;

      const targetIdx = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      state.dealDamage(amount, targetIdx, true, { name: '성가', type: 'trait' });
    },
    onDealDamage(gs, damage, targetIdx) {
      const state = getGS(gs);
      const enemy = state.combat?.enemies[targetIdx];
      if (!enemy || !enemy.statusEffects?.branded) return damage;

      const isPlus = state._currentCard?.id === 'brand_of_light_plus';
      const healAmt = isPlus ? 4 : 2;

      state.addLog(LogUtils.formatEcho(`🕯️ 낙인: 공격 시 체력 ${healAmt} 회복`), 'echo');
      state.heal(healAmt, { name: '빛의 낙인', type: 'status' });
      return damage;
    },
  },
  berserker: {
    onDealDamage(gs, damage) {
      const state = getGS(gs);
      const buff = state?.getBuff?.('berserk_mode');
      const buffPlus = state?.getBuff?.('berserk_mode_plus');
      const activeBuff = buff || buffPlus;
      const growthPerHit = activeBuff === buffPlus ? 3 : 2;

      if (activeBuff) {
        const currentBonus = increaseBuffFieldState(state, activeBuff, 'atkGrowth', growthPerHit);
        state.addLog(LogUtils.formatEcho(`불협화음: 피해 +${growthPerHit} (현재 +${currentBonus})`), 'echo');
      }
      return damage;
    },
  },
  guardian: {
    onTurnEnd(gs) {
      const state = getGS(gs);
      if (state.player.shield > 0) {
        setGuardianPreservedShieldState(state, Math.floor(state.player.shield / 2));
        state.addLog?.(LogUtils.formatShield('플레이어', state.player._preservedShield), 'shield');
      }
    },
    onTurnStart(gs) {
      const state = getGS(gs);
      const preserved = Number(state.player._preservedShield || 0);
      if (preserved > 0) {
        grantPlayerShield(state, preserved);
        setGuardianPreservedShieldState(state, 0);
      }

      const buffEntries = Object.entries(state.player?.buffs || {});
      for (const [buffKey, buff] of buffEntries) {
        if (!buff || typeof buff !== 'object') continue;
        if (buffKey !== 'unbreakable_wall' && buffKey !== 'unbreakable_wall_plus') continue;

        const ratio = Number(buff?.shieldRatio || (buffKey === 'unbreakable_wall_plus' ? 0.9 : 0.6));
        triggerUnbreakableWall(state, buffKey, buff, ratio);
      }
    },
  },
};
