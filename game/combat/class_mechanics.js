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
        res.stacks = 99; // ??됱쓽 ?ㅽ깮?쇰줈 ?좎? 蹂댁옣
      } else {
        state.addBuff('resonance', 99, { dmgBonus: 3 });
      }
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const res = state?.getBuff?.('resonance');
      const val = res ? res.dmgBonus || 0 : 0;
      const meta = globalThis.DATA?.classes?.swordsman;
      const title = meta?.traitTitle || '怨듬챸 (Resonance)';
      const desc = meta?.traitDesc || '移대뱶瑜??ъ슜???뚮쭏???꾨젰???곸듅?⑸땲??';
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
      label.textContent = meta?.traitName || '怨듬챸';
      const value = document.createElement('div');
      value.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);";
      value.textContent = `+${val} ?곕?吏`;
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
        state.addLog(LogUtils.formatEcho('?뵰 硫붿븘由? ?좎씤 ???移대뱶媛 ?놁뒿?덈떎.'), 'echo');
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
      state.addLog(LogUtils.formatEcho(`?뵰 硫붿븘由? ${cardName} 鍮꾩슜 -1`), 'echo');
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
      const title = meta?.traitTitle || '硫붿븘由?(Echo)';
      const desc = meta?.traitDesc || '移대뱶瑜?3踰??ъ슜???뚮쭏??臾댁옉??移대뱶 1?μ쓽 鍮꾩슜??1 媛먯냼?⑸땲??';
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
      label.textContent = meta?.traitName || 'Echo';
      const valEl = document.createElement('div');
      valEl.style.cssText = "font-size:10px;color:var(--cyan);line-height:1.4;";
      valEl.textContent = `諛쒕룞源뚯? ${remaining}??(${progress}/3)`;

      const subEl = document.createElement('div');
      subEl.style.cssText = "font-size:9px;color:var(--text-dim);margin-top:2px;";
      subEl.textContent = lastTargetName ? `理쒓렐 ?좎씤: ${lastTargetName}` : '理쒓렐 ?좎씤: ?놁쓬';

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
        state.addLog(LogUtils.formatEcho('?렞 ?뺤쟻 諛쒕룞: ??遺??諛????'), 'echo');
        state.applyEnemyStatus('poisoned', 3, targetIdx);
        state.addBuff('vanish', 1);
      }
      return damage;
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const meta = globalThis.DATA?.classes?.hunter;
      const title = meta?.traitTitle || '?뺤쟻 (Dead Silence)';
      const desc = meta?.traitDesc || '媛숈? ?곸쓣 5踰?怨듦꺽???뚮쭏???대떦 ?곸뿉寃???3)??遺?ы븯怨? ?먯떊? 1???숈븞 ????곹깭媛 ?⑸땲??';
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
      label.textContent = meta?.traitName || '?뺤쟻';
      const valEl = document.createElement('div');
      valEl.style.cssText = "font-size:10px;color:var(--cyan);";
      valEl.textContent = '?곌꺽 吏꾪뻾 以?..';
      el.append(label, valEl);
      return el;
    },
  },
  paladin: {
    onTurnStart(gs) {
      const state = _getGS(gs);
      const buff = state?.getBuff?.('blessing_of_light');
      if (buff) {
        state.heal(buff.healPerTurn || 0);
        state.addLog(LogUtils.formatHeal('?뚮젅?댁뼱', buff.healPerTurn || 0), 'heal');
      }
    },
    onHeal(gs, amount) {
      const state = _getGS(gs);
      if (amount <= 0 || !state.combat?.enemies || state.combat.enemies.length === 0) return;

      const aliveEnemies = state.combat.enemies.map((e, idx) => e.hp > 0 ? idx : -1).filter(idx => idx !== -1);
      if (aliveEnemies.length === 0) return;

      const targetIdx = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

      state.addLog(LogUtils.formatEcho(`?깃? 諛쒕룞! ?곸뿉寃?${amount} ?쇳빐!`), 'echo');
      // dealDamage takes (amount, targetIdx, isSubDamage, source)
      state.dealDamage(amount, targetIdx, true);
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const meta = globalThis.DATA?.classes?.paladin;
      const title = meta?.traitTitle || '?깃? (Sacred Hymn)';
      const desc = meta?.traitDesc || '泥대젰???뚮났???뚮쭏???뚮났?됰쭔??臾댁옉???곸뿉寃??쇳빐瑜??낇옓?덈떎.';
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
      label.textContent = meta?.traitName || '?깃?';
      const value = document.createElement('div');
      value.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--cyan);";
      value.textContent = `?뚮났 ?????쇳빐`;
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
        state.addLog(LogUtils.formatEcho(`遺덊삊?붿쓬: ?쇳빐 +2 (?꾩옱 +${buff.atkGrowth})`), 'echo');
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
      const title = meta?.traitTitle || '遺덊삊?붿쓬 (Cacophony)';
      const desc = meta?.traitDesc || '泥대젰????쓣?섎줉 ?쇳빐?됱씠 利앺룺?⑸땲?? 怨듦꺽???쒕룄???뚮쭏??怨듦꺽?μ씠 ?곴뎄?곸쑝濡?異붽? ?깆옣?⑸땲??';
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
      label.textContent = meta?.traitName || '遺덊삊?붿쓬';
      const value = document.createElement('div');
      value.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);";
      value.textContent = `蹂대꼫?? +${hpBonus + growBonus}`;
      el.append(label, value);
      return el;
    }
  },
  guardian: {
    onTurnEnd(gs) {
      const state = _getGS(gs);
      if (state.player.shield > 0) {
        state.player._preservedShield = Math.floor(state.player.shield / 2);
        state.addLog(LogUtils.formatShield('?뚮젅?댁뼱', state.player._preservedShield), 'shield');
      }
    },
    onTurnStart(gs) {
      const state = _getGS(gs);
      if (state.player._preservedShield > 0) {
        state.addShield(state.player._preservedShield);
        state.player._preservedShield = 0;
      }

      // 遺덇뎬??踰쎌? 以묒꺽(99)??諛쒕룞 ?잛닔媛 1?뚯뵫 利앷??쒕떎.
      const buff = state.getBuff('unbreakable_wall');
      const buffPlus = state.getBuff('unbreakable_wall_plus');
      _triggerUnbreakableWall(state, 'unbreakable_wall', buff, 0.5);
      _triggerUnbreakableWall(state, 'unbreakable_wall_plus', buffPlus, 0.7);
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const meta = globalThis.DATA?.classes?.guardian;
      const title = meta?.traitTitle || '?붿쁺 媛묒＜ (Echo Armor)';
      const desc = meta?.traitDesc || '留???諛⑹뼱留됱쓽 ?쇰?媛 ?좎??⑸땲??';
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
      label.textContent = meta?.traitName || '?붿쁺 媛묒＜';
      const value = document.createElement('div');
      value.style.cssText = "font-size:10px;color:var(--white);";
      value.textContent = '諛⑹뼱留?50% ?곸떆 ?좎?';
      el.append(label, value);
      return el;
    }
  }
};
