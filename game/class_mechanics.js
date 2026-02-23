'use strict';

(function initClassMechanics(globalObj) {
  function _getGS(gs) {
    return gs || globalObj.GS;
  }

  const ClassMechanics = {
    swordsman: {
      onMove(gs) {
        const state = _getGS(gs);
        if (!state?.player?.buffs) return;
        const momentum = state.player.buffs.momentum;
        if (momentum) {
          momentum.dmgBonus = Math.min(20, (momentum.dmgBonus || 0) + 2);
          momentum.stacks = 1;
        } else {
          state.addBuff('momentum', 1, { dmgBonus: 2 });
        }
      },
      getSpecialUI(gs) {
        const state = _getGS(gs);
        const momentum = state?.getBuff?.('momentum');
        return `<div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">모멘텀</div><div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);">+${momentum ? momentum.dmgBonus || 0 : 0} 데미지</div>`;
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
        const next = state?.combat?.enemies?.[0]?.ai?.(state.combat.turn + 1);
        return `<div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">다음 턴 예측</div><div style="font-size:10px;color:var(--cyan);">${next?.intent || '불명'}</div>`;
      },
    },
    hunter: {
      getSpecialUI(gs) {
        const state = _getGS(gs);
        const gauge = state?.player?.silenceGauge || 0;
        const max = 10;
        const pct = (gauge / max) * 100;
        const color = pct > 70 ? 'var(--danger)' : pct > 40 ? 'var(--gold)' : 'var(--cyan)';
        return `<div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:3px;">침묵 게이지 ${gauge}/${max}</div><div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${color};border-radius:2px;transition:width 0.3s;"></div></div>`;
      },
    },
  };

  globalObj.ClassMechanics = ClassMechanics;
})(window);
