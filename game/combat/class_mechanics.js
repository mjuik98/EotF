import { GS } from '../core/game_state.js';
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
        res.dmgBonus = Math.min(30, (res.dmgBonus || 0) + 1);
        res.stacks = 99;
      } else {
        state.addBuff('resonance', 99, { dmgBonus: 1 });
      }
    },
    onMove(gs) {
      const state = _getGS(gs);
      if (!state?.player?.buffs) return;
      const res = state.player.buffs.resonance;
      if (res) {
        res.dmgBonus = Math.min(30, (res.dmgBonus || 0) + 3);
        res.stacks = 99; // 이동 기반 스택으로 유지 보장
      } else {
        state.addBuff('resonance', 99, { dmgBonus: 3 });
      }
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const res = state?.getBuff?.('resonance');
      const val = res ? res.dmgBonus || 0 : 0;
      const meta = globalThis.DATA?.classes?.swordsman;
      const title = meta?.traitTitle || '공명 (Resonance)';
      const desc = meta?.traitDesc || '카드를 사용할 때마다 공격력이 증가합니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '공명';
      const value = document.createElement('div');
      value.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);";
      value.textContent = `+${val} 데미지`;
      el.append(label, value);
      return el;
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
      const dataCards = globalThis.DATA?.cards || {};
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
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const player = state?.player;
      const progress = Number(player?._mageCastCounter || 0);
      const cycleProgress = progress % 3;
      const remaining = cycleProgress === 0 ? 3 : (3 - cycleProgress);
      const lastTargetId = player?._mageLastDiscountTarget;
      const lastTargetName = lastTargetId ? (globalThis.DATA?.cards?.[lastTargetId]?.name || lastTargetId) : null;
      const meta = globalThis.DATA?.classes?.mage;
      const title = meta?.traitTitle || '메아리 (Echo)';
      const desc = meta?.traitDesc || '카드를 3번 사용할 때마다 무작위 손패 카드 1장의 비용을 1 감소시킵니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '메아리';
      const valEl = document.createElement('div');
      valEl.style.cssText = "font-size:10px;color:var(--cyan);line-height:1.4;";
      valEl.textContent = `발동까지 ${remaining}회 (${progress}/3)`;

      const subEl = document.createElement('div');
      subEl.style.cssText = "font-size:9px;color:var(--text-dim);margin-top:2px;";
      subEl.textContent = lastTargetName ? `최근 할인: ${lastTargetName}` : '최근 할인: 없음';

      el.append(label, valEl, subEl);
      return el;
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

      if (!player._hunterHitCounts) player._hunterHitCounts = {};
      player._hunterHitCounts[targetIdx] = (player._hunterHitCounts[targetIdx] || 0) + 1;

      if (player._hunterHitCounts[targetIdx] >= 5) {
        player._hunterHitCounts[targetIdx] = 0;
        state.addLog(LogUtils.formatEcho('🎯 정적 발동: 독 3 부여 + 은신 1턴'), 'echo');
        state.applyEnemyStatus('poisoned', 3, targetIdx);
        state.addBuff('vanish', 1);
      }
      return damage;
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const meta = globalThis.DATA?.classes?.hunter;
      const title = meta?.traitTitle || '정적 (Dead Silence)';
      const desc = meta?.traitDesc || '같은 적을 5번 공격할 때마다 해당 적에게 독 3을 부여하고, 자신은 1턴 동안 은신 상태가 됩니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '정적';
      const valEl = document.createElement('div');
      valEl.style.cssText = "font-size:10px;color:var(--cyan);";
      valEl.textContent = '공격 진행 중...';
      el.append(label, valEl);
      return el;
    },
  },
  paladin: {
    onTurnStart(gs) {
      const state = _getGS(gs);
      const buff = state?.getBuff?.('blessing_of_light_plus') || state?.getBuff?.('blessing_of_light');
      const healAmount = Number(buff?.healPerTurn || 0);
      if (healAmount > 0) state.heal(healAmount);
    },
    onHeal(gs, amount) {
      const state = _getGS(gs);
      if (amount <= 0 || !state.combat?.enemies || state.combat.enemies.length === 0) return;

      const aliveEnemies = state.combat.enemies.map((e, idx) => e.hp > 0 ? idx : -1).filter(idx => idx !== -1);
      if (aliveEnemies.length === 0) return;

      const targetIdx = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

      state.addLog(LogUtils.formatEcho(`성가 발동! 적에게 ${amount} 피해!`), 'echo');
      // dealDamage takes (amount, targetIdx, isSubDamage, source)
      state.dealDamage(amount, targetIdx, true);
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const meta = globalThis.DATA?.classes?.paladin;
      const title = meta?.traitTitle || '성가 (Sacred Hymn)';
      const desc = meta?.traitDesc || '체력을 회복할 때마다 회복량만큼 무작위 적에게 피해를 입힙니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '성가';
      const value = document.createElement('div');
      value.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--cyan);";
      value.textContent = '회복 시 추가 피해';
      el.append(label, value);
      return el;
    }
  },
  berserker: {
    onDealDamage(gs, damage) {
      const state = _getGS(gs);
      const buff = state?.getBuff?.('berserk_mode');
      if (buff) {
        buff.atkGrowth = (buff.atkGrowth || 0) + 2;
        state.addLog(LogUtils.formatEcho(`불협화음: 피해 +2 (현재 +${buff.atkGrowth})`), 'echo');
      }
      return damage;
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const lostHp = state ? (state.player.maxHp - state.player.hp) : 0;
      const hpBonus = Math.floor(lostHp / 10) * 3;
      const buff = state?.getBuff?.('berserk_mode');
      const growBonus = buff ? buff.atkGrowth || 0 : 0;
      const meta = globalThis.DATA?.classes?.berserker;
      const title = meta?.traitTitle || '불협화음 (Cacophony)';
      const desc = meta?.traitDesc || '체력이 낮을수록 피해 보너스가 증가합니다. 공격할 때마다 공격력이 영구적으로 추가 성장합니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '불협화음';
      const value = document.createElement('div');
      value.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);";
      value.textContent = `보너스 +${hpBonus + growBonus}`;
      el.append(label, value);
      return el;
    }
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
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const meta = globalThis.DATA?.classes?.guardian;
      const title = meta?.traitTitle || '유령 갑주 (Echo Armor)';
      const desc = meta?.traitDesc || '매 턴 종료 시 방어막의 절반을 유지합니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = globalThis.TooltipUI || globalThis.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '유령 갑주';
      const value = document.createElement('div');
      value.style.cssText = "font-size:10px;color:var(--white);";
      value.textContent = '방어막 50% 턴 시작 유지';
      el.append(label, value);
      return el;
    }
  }
};
