'use strict';

(function initClassMechanics(globalObj) {
  function _getGS(gs) {
    return gs || globalObj.GS;
  }

  const ClassMechanics = {
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
        const title = '모멘텀 (Momentum)';
        const desc = '전투의 흐름을 타는 기술입니다. 카드를 호출(사용)하거나 맵에서 이동할 때마다 다음 공격의 위력이 상승합니다. (최대 +30 피해 보너스)';
        return `<div onmouseenter="TooltipUI.showGeneralTooltip(event, '${title}', '${desc}')" onmouseleave="TooltipUI.hideGeneralTooltip()" style="cursor:help;">
          <div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">모멘텀</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);">+${val} 데미지</div>
        </div>`;
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
        const title = '심안 (Eye of Insight)';
        const desc = '미래의 잔향을 읽어냅니다. 현재 선택한 적이 다음 턴에 행할 의도(공격, 방어, 디버프 등)를 미리 파악하여 전략적으로 대응할 수 있습니다.';

        return `<div onmouseenter="TooltipUI.showGeneralTooltip(event, '${title}', '${desc}')" onmouseleave="TooltipUI.hideGeneralTooltip()" style="cursor:help;">
          <div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">다음 턴 예측</div>
          <div style="font-size:10px;color:var(--cyan);">${next?.intent || '활성 적 없음'}</div>
        </div>`;
      },
    },
    hunter: {
      getSpecialUI(gs) {
        const state = _getGS(gs);
        const gauge = state?.player?.silenceGauge || 0;
        const max = 10;
        const pct = (gauge / max) * 100;
        const color = pct > 70 ? 'var(--danger)' : pct > 40 ? 'var(--gold)' : 'var(--cyan)';
        const title = '침묵의 사냥 (Silent Hunt)';
        const desc = '적의 숨소리조차 차단합니다. 카드를 사용할 때마다 게이지가 차오르며, 10에 도달하면 다음 공격 시 대상을 1턴간 기절(기능 마비) 시킵니다.';
        return `<div onmouseenter="TooltipUI.showGeneralTooltip(event, '${title}', '${desc}')" onmouseleave="TooltipUI.hideGeneralTooltip()" style="cursor:help;">
          <div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:3px;">침묵 게이지 ${gauge}/${max}</div>
          <div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:${color};border-radius:2px;transition:width 0.3s;"></div>
          </div>
        </div>`;
      },
    },
    paladin: {
      onTurnStart(gs) {
        const state = _getGS(gs);
        const buff = state?.getBuff?.('blessing_of_light');
        if (buff) {
          state.heal(buff.healPerTurn || 0);
          state.addLog(`✨ 빛의 축복으로 ${buff.healPerTurn} 회복`, 'heal');
        }
      },
      getSpecialUI(gs) {
        const state = _getGS(gs);
        const buff = state?.getBuff?.('blessing_of_light');
        const val = buff ? buff.healPerTurn : 0;
        const title = '빛의 가호 (Divine Grace)';
        const desc = '성스러운 신성력이 몸을 감쌉니다. 매 턴 시작 시 일정량의 체력을 지속적으로 회복하여 전투 지속력을 대폭 높여줍니다.';
        return `<div onmouseenter="TooltipUI.showGeneralTooltip(event, '${title}', '${desc}')" onmouseleave="TooltipUI.hideGeneralTooltip()" style="cursor:help;">
          <div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">빛의 축복</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--cyan);">재생: ${val} HP/턴</div>
        </div>`;
      }
    },
    berserker: {
      onDealDamage(gs, damage) {
        const state = _getGS(gs);
        const buff = state?.getBuff?.('berserk_mode');
        if (buff) {
          buff.atkGrowth = (buff.atkGrowth || 0) + 2;
          state.addLog(`😡 광폭화: 피해 +2 (현재 +${buff.atkGrowth})`, 'echo');
        }
        return damage;
      },
      getSpecialUI(gs) {
        const state = _getGS(gs);
        const lostHp = state ? (state.player.maxHp - state.player.hp) : 0;
        const hpBonus = Math.floor(lostHp / 10) * 3;
        const buff = state?.getBuff?.('berserk_mode');
        const growBonus = buff ? buff.atkGrowth || 0 : 0;
        const title = '광기 어린 투지 (Insane Rage)';
        const desc = '고통을 힘으로 바꿉니다. 잃은 체력 10당 공격력이 3씩 상승하며, 공격을 시도할 때마다 공격력이 영구적으로 추가 성장합니다.';
        return `<div onmouseenter="TooltipUI.showGeneralTooltip(event, '${title}', '${desc}')" onmouseleave="TooltipUI.hideGeneralTooltip()" style="cursor:help;">
          <div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">광기의 힘</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);">보너스: +${hpBonus + growBonus}</div>
        </div>`;
      }
    },
    berserker: {
      onDealDamage(gs, damage) {
        const state = _getGS(gs);
        const buff = state?.getBuff?.('berserk_mode');
        if (buff) {
          buff.atkGrowth = (buff.atkGrowth || 0) + 2;
          state.addLog(`😡 광폭화: 피해 +2 (현재 +${buff.atkGrowth})`, 'echo');
        }
        return damage;
      },
      getSpecialUI(gs) {
        const state = _getGS(gs);
        const lostHp = state ? (state.player.maxHp - state.player.hp) : 0;
        const hpBonus = Math.floor(lostHp / 10) * 3;
        const buff = state?.getBuff?.('berserk_mode');
        const growBonus = buff ? buff.atkGrowth || 0 : 0;
        const title = '광기 어린 투지 (Insane Rage)';
        const desc = '고통을 힘으로 바꿉니다. 잃은 체력 10당 공격력이 3씩 상승하며, 공격을 시도할 때마다 공격력이 영구적으로 추가 성장합니다.';
        return `<div onmouseenter="TooltipUI.showGeneralTooltip(event, '${title}', '${desc}')" onmouseleave="TooltipUI.hideGeneralTooltip()" style="cursor:help;">
          <div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">광기의 힘</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);">보너스: +${hpBonus + growBonus}</div>
        </div>`;
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
        const title = '난공불락의 장벽 (The Iron Wall)';
        const desc = '철벽의 방어력을 자랑합니다. 턴이 종료되어도 방어막이 모두 사라지 지 않고, 50%를 보존하여 다음 턴의 안전을 보장합니다.';
        return `<div onmouseenter="TooltipUI.showGeneralTooltip(event, '${title}', '${desc}')" onmouseleave="TooltipUI.hideGeneralTooltip()" style="cursor:help;">
          <div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">방패 장벽</div>
          <div style="font-size:10px;color:var(--white);">${hasWall ? '불굴의 벽 활성 (50% 유지)' : '일반 방어 상태'}</div>
        </div>`;
      }
    }
  };

  globalObj.ClassMechanics = ClassMechanics;
})(window);
