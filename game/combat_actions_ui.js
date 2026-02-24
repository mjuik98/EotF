'use strict';

(function initCombatActionsUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const CombatActionsUI = {
    sortHandByEnergy(deps = {}) {
      const gs = deps.gs;
      const data = deps.data;
      if (!gs?.player?.hand || !data?.cards) return;
      if (!gs.combat.active || !gs.combat.playerTurn) return;

      gs.player.hand.sort((a, b) => {
        const ca = data.cards[a];
        const cb = data.cards[b];
        if (!ca || !cb) return 0;
        return (ca.cost || 0) - (cb.cost || 0);
      });

      if (typeof deps.renderCombatCards === 'function') deps.renderCombatCards();
      gs.addLog('🃏 손패를 비용 순으로 정렬했다', 'system');
    },

    drawCard(deps = {}) {
      const gs = deps.gs;
      if (!gs) return;

      const maxHand = 8;
      if (!gs.combat.active || !gs.combat.playerTurn) return;

      const doc = _getDoc(deps);
      const btn = doc.getElementById('drawCardBtn');
      if (btn && gs.player.hand.length < maxHand) {
        btn.classList.remove('hand-full');
      }

      if (gs.player.hand.length >= maxHand) {
        gs.addLog(`⚠️ 손패가 가득 찼습니다 (최대 ${maxHand}장)`, 'damage');
        if (btn) {
          btn.disabled = true;
          btn.classList.add('hand-full');
          btn.style.animation = 'none';
          globalObj.requestAnimationFrame(() => { btn.style.animation = 'shake 0.3s ease'; });
        }
        if (typeof deps.updateUI === 'function') deps.updateUI();
        return;
      }

      if (gs.player.energy < 1) {
        gs.addLog('⚠️ 에너지 부족! (카드 뽑기: 1 에너지)', 'damage');
        const orbs = doc.getElementById('energyOrbs');
        if (orbs) {
          orbs.style.animation = 'none';
          globalObj.requestAnimationFrame(() => { orbs.style.animation = 'shake 0.3s ease'; });
        }
        deps.audioEngine?.playHit?.();
        if (typeof deps.updateUI === 'function') deps.updateUI();
        return;
      }

      gs.player.energy -= 1;
      gs.drawCards(1);
      if (typeof deps.updateUI === 'function') deps.updateUI();
      if (typeof deps.renderCombatCards === 'function') deps.renderCombatCards();
    },
  };

  globalObj.CombatActionsUI = CombatActionsUI;
})(window);
