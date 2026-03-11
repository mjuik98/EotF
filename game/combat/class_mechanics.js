import { DATA } from '../../data/game_data.js';
import { LogUtils } from '../utils/log_utils.js';


function _getGS(gs) {
  return gs;
}

const UNBREAKABLE_WALL_STACK_UNIT = 99;

function _getUnbreakableWallHits(buff) {
  const stacks = Number(buff?.stacks || 0);
  if (!Number.isFinite(stacks) || stacks <= 0) return 0;
  return Math.max(1, Math.floor(stacks / UNBREAKABLE_WALL_STACK_UNIT));
}

function _getAliveEnemyIndexes(state) {
  return state.combat?.enemies
    ?.map((enemy, idx) => (enemy.hp > 0 ? idx : -1))
    .filter((idx) => idx !== -1) || [];
}

function _triggerUnbreakableWall(state, buffKey, buff, ratio) {
  if (!state || !buff || ratio <= 0) return;

  const shield = Number(state.player?.shield || 0);
  if (!Number.isFinite(shield) || shield <= 0) return;

  const damagePerHit = Math.floor(shield * ratio);
  if (damagePerHit <= 0) return;

  const hits = _getUnbreakableWallHits(buff);
  if (hits <= 0) return;

  const label = buffKey === 'unbreakable_wall_plus'
    ? '\uBD88\uAD74\uC758 \uBCBD+'
    : '\uBD88\uAD74\uC758 \uBCBD';

  for (let i = 0; i < hits; i++) {
    const aliveEnemies = _getAliveEnemyIndexes(state);
    if (!aliveEnemies.length) break;

    const targetIdx = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    const hitSuffix = hits > 1 ? ` (${i + 1}/${hits})` : '';
    state.addLog(
      LogUtils.formatEcho(`${label}${hitSuffix}: \uC801\uC5D0\uAC8C ${damagePerHit} \uD53C\uD574!`),
      'echo',
    );
    state.dealDamage(damagePerHit, targetIdx, true);
  }
}

export const ClassMechanics = {
  swordsman: {
    onPlayCard(gs, { cardId }) {
      const state = _getGS(gs);
      if (!state?.player?.buffs) return;
      const res = state.player.buffs.resonance;
      if (res) {
        const prev = Number(res.dmgBonus || 0);
        const next = Math.min(30, prev + 1);
        const delta = Math.max(0, next - prev);
        if (delta > 0) {
          // Dispatch-based update keeps status UI in sync every card play.
          state.addBuff('resonance', 0, { dmgBonus: delta });
        }
        state.player.buffs.resonance.stacks = 99;
      } else {
        state.addBuff('resonance', 99, { dmgBonus: 1 });
      }
      state.markDirty?.('hud');
    },
    onMove(gs) {
      const state = _getGS(gs);
      if (!state?.combat?.active) return;
      if (!state?.player?.buffs) return;
      const res = state.player.buffs.resonance;
      if (res) {
        res.dmgBonus = Math.min(30, (res.dmgBonus || 0) + 3);
        res.stacks = 99; // 이동 기반 스택으로 유지 보장
      } else {
        state.addBuff('resonance', 99, { dmgBonus: 3 });
      }
    },
  },
  mage: {
    onCombatStart(gs) {
      const state = _getGS(gs);
      if (!state?.player) return;
      state.player._mageCastCounter = 0;
      state.player._traitCardDiscounts = {};
      state.player._mageLastDiscountTarget = null;
    },
    onPlayCard(gs) {
      const state = _getGS(gs);
      const player = state?.player;
      if (!state || !player) return;

      player._mageCastCounter = (player._mageCastCounter || 0) + 1;
      if (player._mageCastCounter < 3) {
        state.markDirty?.('hud');
        return;
      }

      player._mageCastCounter = 0;
      const hand = Array.isArray(player.hand) ? player.hand : [];
      const dataCards = DATA?.cards || {};
      const candidates = hand.filter((id) => (dataCards[id]?.cost || 0) > 0);

      if (candidates.length === 0) {
        player._mageLastDiscountTarget = null;
        state.addLog(LogUtils.formatEcho('🔮 메아리: 할인 가능한 카드가 없습니다.'), 'echo');
        state.markDirty?.('hud');
        return;
      }

      const pickedId = candidates[Math.floor(Math.random() * candidates.length)];
      if (!player._traitCardDiscounts || typeof player._traitCardDiscounts !== 'object') {
        player._traitCardDiscounts = {};
      }
      player._traitCardDiscounts[pickedId] = (player._traitCardDiscounts[pickedId] || 0) + 1;
      player._mageLastDiscountTarget = pickedId;

      const cardName = dataCards[pickedId]?.name || pickedId;
      state.addLog(LogUtils.formatEcho(`🔮 메아리: ${cardName} 비용 -1`), 'echo');
      state.markDirty?.('hand');
      state.markDirty?.('hud');
    },
  },
  hunter: {
    onCombatStart(gs) {
      const state = _getGS(gs);
      if (state.player) {
        state.player._hunterHitCounts = {};
      }
    },
    onDealDamage(gs, damage, targetIdx) {
      const state = _getGS(gs);
      const player = state?.player;
      if (!player || targetIdx === null) return damage;

      const pendingMark = Number(player._classMasteryHunterMarkPending || 0);
      if (pendingMark > 0 && Number(damage || 0) > 0 && targetIdx >= 0) {
        state.applyEnemyStatus?.('marked', pendingMark, targetIdx);
        player._classMasteryHunterMarkPending = 0;
        state.addLog?.(LogUtils.formatEcho(`Hunter awakening: Mark ${pendingMark} applied.`), 'echo');
      }

      if (!player._hunterHitCounts) player._hunterHitCounts = {};
      player._hunterHitCounts[targetIdx] = (player._hunterHitCounts[targetIdx] || 0) + 1;

      if (player._hunterHitCounts[targetIdx] >= 5) {
        player._hunterHitCounts[targetIdx] = 0;
        state.addLog(LogUtils.formatEcho('🎯 정적 발동: 독 3턴 부여 + 카드 1장 드로우'), 'echo');
        state.applyEnemyStatus('poisoned', 3, targetIdx);
        state.drawCards?.(1);
      }
      return damage;
    },
  },
  paladin: {
    onTurnStart(gs) {
      const state = _getGS(gs);
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
      const state = _getGS(gs);
      if (amount <= 0 || !state.combat?.enemies || state.combat.enemies.length === 0) return;

      const aliveEnemies = state.combat.enemies.map((e, idx) => e.hp > 0 ? idx : -1).filter(idx => idx !== -1);
      if (aliveEnemies.length === 0) return;

      const targetIdx = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

      // dealDamage takes (amount, targetIdx, isSubDamage, source, deps)
      state.dealDamage(amount, targetIdx, true, { name: '성가', type: 'trait' });
    },
    onDealDamage(gs, damage, targetIdx) {
      const state = _getGS(gs);
      const enemy = state.combat?.enemies[targetIdx];
      if (!enemy || !enemy.statusEffects?.branded) return damage;

      // 낙인 수치(회복량) 결정
      const isPlus = state._currentCard?.id === 'brand_of_light_plus';
      const healAmt = isPlus ? 4 : 2;

      state.addLog(LogUtils.formatEcho(`🕯️ 낙인: 공격 시 체력 ${healAmt} 회복`), 'echo');
      state.heal(healAmt, { name: '빛의 낙인', type: 'status' });
      return damage;
    },
  },
  berserker: {
    onDealDamage(gs, damage) {
      const state = _getGS(gs);
      const buff = state?.getBuff?.('berserk_mode');
      const buffPlus = state?.getBuff?.('berserk_mode_plus');
      const activeBuff = buff || buffPlus;
      const growthPerHit = activeBuff === buffPlus ? 3 : 2;

      if (activeBuff) {
        activeBuff.atkGrowth = (activeBuff.atkGrowth || 0) + growthPerHit;
        const currentBonus = activeBuff.atkGrowth;
        state.addLog(LogUtils.formatEcho(`불협화음: 피해 +${growthPerHit} (현재 +${currentBonus})`), 'echo');
      }
      return damage;
    },
  },
  guardian: {
    onTurnEnd(gs) {
      const state = _getGS(gs);
      if (state.player.shield > 0) {
        state.player._preservedShield = Math.floor(state.player.shield / 2);
        state.addLog(LogUtils.formatShield('플레이어', state.player._preservedShield), 'shield');
      }
    },
    onTurnStart(gs) {
      const state = _getGS(gs);
      if (state.player._preservedShield > 0) {
        state.addShield(state.player._preservedShield);
        state.player._preservedShield = 0;
      }

      // 불굴의 벽 중첩(99)마다 발동 횟수가 1회씩 증가한다.
      const buff = state.getBuff('unbreakable_wall');
      const buffPlus = state.getBuff('unbreakable_wall_plus');
      _triggerUnbreakableWall(state, 'unbreakable_wall', buff, 0.5);
      _triggerUnbreakableWall(state, 'unbreakable_wall_plus', buffPlus, 0.7);
    },
  }
};
