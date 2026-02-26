function _getDoc(deps) {
  return deps?.doc || document;
}

export const CombatActionsUI = {
  drawCard(deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    const maxHand = 8;
    if (!gs.combat.active || !gs.combat.playerTurn) return;

    const doc = _getDoc(deps);
    const btn = doc.getElementById('combatDrawCardBtn');
    if (btn && gs.player.hand.length < maxHand) {
      btn.classList.remove('hand-full');
    }

    if (gs.player.hand.length >= maxHand) {
      gs.addLog(`⚠️ 손패가 가득 찼습니다 (최대 ${maxHand}장)`, 'damage');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('hand-full');
        btn.style.animation = 'none';
        window.requestAnimationFrame(() => { btn.style.animation = 'shake 0.3s ease'; });
      }
      if (typeof deps.updateUI === 'function') deps.updateUI();
      return;
    }

    if (gs.player.energy < 1) {
      gs.addLog('⚠️ 에너지 부족! (카드 뽑기: 1 에너지)', 'damage');
      const orbs = doc.getElementById('energyOrbs');
      if (orbs) {
        orbs.style.animation = 'none';
        window.requestAnimationFrame(() => { orbs.style.animation = 'shake 0.3s ease'; });
      }
      deps.audioEngine?.playHit?.();
      if (typeof deps.updateUI === 'function') deps.updateUI();
      return;
    }

    gs.player.energy -= 1;
    gs.drawCards(1);
    if (typeof deps.updateUI === 'function') deps.updateUI();
    if (typeof deps.renderCombatCards === 'function') deps.renderCombatCards();
  }
};
