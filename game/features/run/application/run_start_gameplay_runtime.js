import {
  playStageEntryFadeTransition,
  removeRunStartHandoffBlackout,
} from '../presentation/browser/run_start_transition_runtime.js';

function scheduleWorldMemoryNotice(deps = {}, gs = {}) {
  setTimeout(() => {
    const wm = gs.worldMemory || {};
    const hints = [];
    if ((wm.savedMerchant || 0) > 0) hints.push('상인들이 당신을 기억한다');
    if (wm.killed_ancient_echo) hints.push('태고의 잔향이 기다린다');
    if (hints.length && typeof deps.showWorldMemoryNotice === 'function') {
      deps.showWorldMemoryNotice(hints.join(' · '));
    }
  }, 1000);
}

export function createRunGameplayRuntime({ deps = {}, doc, gs, win }) {
  let gameplayStarted = false;

  const beginGameplay = () => {
    if (gameplayStarted) return;
    gameplayStarted = true;
    removeRunStartHandoffBlackout(doc);

    if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
    const mainTitleSubScreen = doc.getElementById('mainTitleSubScreen');
    const charSelectSubScreen = doc.getElementById('charSelectSubScreen');
    if (mainTitleSubScreen) mainTitleSubScreen.style.display = '';
    if (charSelectSubScreen) charSelectSubScreen.style.display = 'none';

    if (typeof deps.markGameStarted === 'function') deps.markGameStarted();
    if (typeof deps.generateMap === 'function') deps.generateMap(0);
    deps.audioEngine?.startAmbient?.(0);
    if (typeof deps.updateUI === 'function') deps.updateUI();
    if (typeof deps.updateClassSpecialUI === 'function') deps.updateClassSpecialUI();

    setTimeout(() => {
      if (typeof deps.initGameCanvas === 'function') deps.initGameCanvas();
      const raf = deps.requestAnimationFrame || win?.requestAnimationFrame;
      if (typeof raf === 'function' && typeof deps.gameLoop === 'function') {
        raf(deps.gameLoop);
      }
    }, 80);

    scheduleWorldMemoryNotice(deps, gs);
  };

  const beginGameplayWithStageFade = () => {
    playStageEntryFadeTransition({
      doc,
      win,
      requestAnimationFrame: deps.requestAnimationFrame,
    }, beginGameplay);
    removeRunStartHandoffBlackout(doc);
  };

  return {
    beginGameplay,
    beginGameplayWithStageFade,
  };
}
