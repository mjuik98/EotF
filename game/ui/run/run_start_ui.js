import { GS } from '../../core/game_state.js';


  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || window.GS;
  }

  export const RunStartUI = {
    enterRun(deps = {}) {
      const gs = _getGS(deps);
      if (!gs) return;

      if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
      // 시작 시 타이틀 화면 상태 초기화
      const doc = _getDoc(deps);
      doc.getElementById('mainTitleSubScreen').style.display = 'block';
      doc.getElementById('charSelectSubScreen').style.display = 'none';

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
        if ((wm.savedMerchant || 0) > 0) hints.push('🤝 상인들이 당신을 기억한다');
        if (wm.killed_ancient_echo) hints.push('💀 태고의 잔향이 기다린다');
        if (hints.length && typeof deps.showWorldMemoryNotice === 'function') {
          deps.showWorldMemoryNotice(hints.join(' · '));
        }
      }, 1000);

      if (gs.meta?.runCount > 1) {
        const doc = _getDoc(deps);
        setTimeout(() => {
          const badge = doc.createElement('div');
          badge.style.cssText = 'position:fixed;top:16px;right:16px;font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(123,47,255,0.6);z-index:20;';
          badge.textContent = `RUN ${gs.meta.runCount}`;
          doc.getElementById('gameScreen')?.appendChild(badge);
        }, 500);
      }
    },
  };
