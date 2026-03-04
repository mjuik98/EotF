import { runIdempotent } from '../../utils/idempotency_utils.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

export const RunStartUI = {
  enterRun(deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;

    return runIdempotent('run:enter-run', () => {
      const doc = _getDoc(deps);
      if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
      const mainTitleSubScreen = doc.getElementById('mainTitleSubScreen');
      const charSelectSubScreen = doc.getElementById('charSelectSubScreen');
      // Reset title UI state after screen switch so hidden title content never flashes.
      if (mainTitleSubScreen) mainTitleSubScreen.style.display = 'block';
      if (charSelectSubScreen) charSelectSubScreen.style.display = 'none';

      if (typeof deps.markGameStarted === 'function') deps.markGameStarted();
      if (typeof deps.generateMap === 'function') deps.generateMap(0);
      deps.audioEngine?.startAmbient?.(0);
      if (typeof deps.updateUI === 'function') deps.updateUI();
      if (typeof deps.updateClassSpecialUI === 'function') deps.updateClassSpecialUI();

      setTimeout(() => {
        if (typeof deps.initGameCanvas === 'function') deps.initGameCanvas();
        const raf = deps.requestAnimationFrame || window.requestAnimationFrame;
        if (typeof raf === 'function' && typeof deps.gameLoop === 'function') {
          raf(deps.gameLoop);
        }
      }, 80);

      setTimeout(() => {
        if (typeof deps.showRunFragment === 'function') deps.showRunFragment();
        const wm = gs.worldMemory || {};
        const hints = [];
        if ((wm.savedMerchant || 0) > 0) hints.push('\uC0C1\uC778\uB4E4\uC774 \uB2F9\uC2E0\uC744 \uAE30\uC5B5\uD55C\uB2E4');
        if (wm.killed_ancient_echo) hints.push('\uD0DC\uACE0\uC758 \uC794\uD5A5\uC774 \uAE30\uB2E4\uB9B0\uB2E4');
        if (hints.length && typeof deps.showWorldMemoryNotice === 'function') {
          deps.showWorldMemoryNotice(hints.join(' \u00B7 '));
        }
      }, 1000);

    }, { ttlMs: 2000 });
  },
};
