import { GS } from '../core/game_state.js';


function _getGS(gs) {
  return gs;
}

export const ClassMechanics = {
  swordsman: {
    onPlayCard(gs, { cardId }) {
      const state = _getGS(gs);
      if (!state?.player?.buffs) return;
      const momentum = state.player.buffs.momentum;
      if (momentum) {
        momentum.dmgBonus = Math.min(30, (momentum.dmgBonus || 0) + 1);
        momentum.stacks = 99;
      } else {
        state.addBuff('momentum', 99, { dmgBonus: 1 });
      }
    },
    onMove(gs) {
      const state = _getGS(gs);
      if (!state?.player?.buffs) return;
      const momentum = state.player.buffs.momentum;
      if (momentum) {
        momentum.dmgBonus = Math.min(30, (momentum.dmgBonus || 0) + 3);
        momentum.stacks = 99; // 대량의 스택으로 유지 보장
      } else {
        state.addBuff('momentum', 99, { dmgBonus: 3 });
      }
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const momentum = state?.getBuff?.('momentum');
      const val = momentum ? momentum.dmgBonus || 0 : 0;
      const meta = window.DATA?.classes?.swordsman;
      const title = meta?.traitTitle || '모멘텀 (Momentum)';
      const desc = meta?.traitDesc || '카드를 사용할 때마다 위력이 상승합니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
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
      if (!state) return;
      state._prediction = true;
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const target = state?.combat?.enemies ? state.combat.enemies[state._selectedTarget || 0] : null;
      const next = (target && target.hp > 0) ? target.ai?.(state.combat.turn + 2) : null;
      const meta = window.DATA?.classes?.mage;
      const title = meta?.traitTitle || '예지';
      const desc = meta?.traitDesc || '적의 다음 행동을 미리 파악합니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '예지';
      const valEl = document.createElement('div');
      valEl.style.cssText = "font-size:10px;color:var(--cyan);";
      valEl.textContent = next?.intent || '활성 적 없음';
      el.append(label, valEl);
      return el;
    },
  },
  hunter: {
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const gauge = state?.player?.silenceGauge || 0;
      const max = 10;
      const pct = (gauge / max) * 100;
      const color = pct > 70 ? 'var(--danger)' : pct > 40 ? 'var(--gold)' : 'var(--cyan)';
      const meta = window.DATA?.classes?.hunter;
      const title = meta?.traitTitle || '침묵 (Silence)';
      const desc = meta?.traitDesc || '침묵 원소의 흐름을 조절합니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:3px;";
      label.textContent = `침묵 게이지 ${gauge}/${max}`;
      const track = document.createElement('div');
      track.style.cssText = 'height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;';
      const bar = document.createElement('div');
      bar.style.cssText = `width:${pct}%;height:100%;background:${color};border-radius:2px;transition:width 0.3s;`;
      track.appendChild(bar);
      el.append(label, track);
      return el;
    },
  },
  paladin: {
    onTurnStart(gs) {
      const state = _getGS(gs);
      const buff = state?.getBuff?.('blessing_of_light');
      if (buff) {
        state.heal(buff.healPerTurn || 0);
        state.addLog(`☀️ 빛의 축복: HP +${buff.healPerTurn}`, 'heal');
      }
    },
    onHeal(gs, amount) {
      const state = _getGS(gs);
      if (amount <= 0 || !state.combat?.enemies || state.combat.enemies.length === 0) return;

      const aliveEnemies = state.combat.enemies.map((e, idx) => e.hp > 0 ? idx : -1).filter(idx => idx !== -1);
      if (aliveEnemies.length === 0) return;

      const targetIdx = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

      state.addLog(`✨ 성가 발동! 적에게 ${amount} 피해!`, 'echo');
      // dealDamage takes (amount, targetIdx, isSubDamage, source)
      state.dealDamage(amount, targetIdx, true);
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const meta = window.DATA?.classes?.paladin;
      const title = meta?.traitTitle || '빛의 가호 (Divine Grace)';
      const desc = meta?.traitDesc || '체력을 회복할 때마다 회복량만큼 무작위 적에게 피해를 입힙니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '성가';
      const value = document.createElement('div');
      value.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--cyan);";
      value.textContent = `회복 시 적 피해`;
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
        state.addLog(`😡 광기 어린 투지: 피해 +2 (현재 +${buff.atkGrowth})`, 'echo');
      }
      return damage;
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const lostHp = state ? (state.player.maxHp - state.player.hp) : 0;
      const hpBonus = Math.floor(lostHp / 10) * 3;
      const buff = state?.getBuff?.('berserk_mode');
      const growBonus = buff ? buff.atkGrowth || 0 : 0;
      const meta = window.DATA?.classes?.berserker;
      const title = meta?.traitTitle || '광기 어린 투지';
      const desc = meta?.traitDesc || '체력이 낮을수록 피해량이 증폭됩니다. 공격을 시도할 때마다 공격력이 영구적으로 추가 성장합니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '불협화음';
      const value = document.createElement('div');
      value.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);";
      value.textContent = `보너스: +${hpBonus + growBonus}`;
      el.append(label, value);
      return el;
    }
  },
  shielder: {
    onTurnEnd(gs) {
      const state = _getGS(gs);
      const buff = state?.getBuff?.('unbreakable_wall');
      if (buff && state.player.shield > 0) {
        state.player._preservedShield = Math.floor(state.player.shield / 2);
        state.addLog(`🧱 불굴의 벽: 방어막 ${state.player._preservedShield} 유지`, 'system');
      }
    },
    onTurnStart(gs) {
      const state = _getGS(gs);
      if (state.player._preservedShield > 0) {
        state.addShield(state.player._preservedShield);
        state.player._preservedShield = 0;
      }
    },
    getSpecialUI(gs) {
      const state = _getGS(gs);
      const hasWall = !!state?.getBuff?.('unbreakable_wall');
      const meta = window.DATA?.classes?.shielder;
      const title = meta?.traitTitle || '영혼 갑주 (Soul Armor)';
      const desc = meta?.traitDesc || '매 턴 방어막의 일부가 유지됩니다.';
      const el = document.createElement('div');
      el.style.cursor = 'help';
      el.addEventListener('mouseenter', e => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.showGeneralTooltip) {
          tt.showGeneralTooltip(e, title, desc, { doc: document, win: window });
        }
      });
      el.addEventListener('mouseleave', () => {
        const tt = window.TooltipUI || window.GAME?.Modules?.TooltipUI;
        if (tt?.hideGeneralTooltip) {
          tt.hideGeneralTooltip({ doc: document, win: window });
        }
      });
      const label = document.createElement('div');
      label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
      label.textContent = meta?.traitName || '잔영 갑주';
      const value = document.createElement('div');
      value.style.cssText = "font-size:10px;color:var(--white);";
      const wallTitle = meta?.traitName || '방패 장벽';
      value.textContent = hasWall ? `${wallTitle} 활성 (50% 유지)` : '일반 방어 상태';
      el.append(label, value);
      return el;
    }
  }
};
