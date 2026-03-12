import { runIdempotent } from '../../../utils/idempotency_utils.js';
import { startEchoRippleDissolve } from '../../../platform/browser/effects/echo_ripple_transition.js';

export const RUN_START_HANDOFF_BLACKOUT_ID = 'runStartHandoffBlackoutOverlay';

export function getRunStartDoc(deps) {
  return deps?.doc || document;
}

export function getRunStartGs(deps) {
  return deps?.gs;
}

export function getRunStartWin(deps) {
  return deps?.win || window;
}

export function removeRunStartHandoffBlackout(doc) {
  if (!doc) return;
  doc.getElementById?.(RUN_START_HANDOFF_BLACKOUT_ID)?.remove?.();
}

export function playRunEntryTransition(deps = {}, onComplete = () => {}) {
  const doc = getRunStartDoc(deps);
  const win = getRunStartWin(deps);

  if (!doc?.body || !win) {
    onComplete();
    return;
  }

  const overlay = doc.createElement('div');
  overlay.id = 'runEntryTransitionOverlay';
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:radial-gradient(circle at center, rgba(94, 50, 170, 0.24) 0%, rgba(3, 3, 10, 0.95) 62%, rgba(0, 0, 0, 1) 100%)',
    'z-index:2100',
    'pointer-events:none',
    'opacity:1',
  ].join(';');
  doc.body.appendChild(overlay);

  startEchoRippleDissolve(overlay, {
    doc,
    win,
    requestAnimationFrame: deps.requestAnimationFrame,
    cancelAnimationFrame: deps.cancelAnimationFrame,
    onComplete,
  });
}

export function playStageEntryFadeTransition(deps = {}, onMidpoint = () => {}) {
  const doc = getRunStartDoc(deps);
  const win = getRunStartWin(deps);

  if (!doc?.body || !win) {
    onMidpoint();
    return;
  }

  const fadeInMs = 220;
  const holdMs = 110;
  const fadeOutMs = 260;

  const overlay = doc.createElement('div');
  overlay.id = 'runStageFadeTransitionOverlay';
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:#000',
    'opacity:1',
    'z-index:2102',
    'pointer-events:none',
  ].join(';');
  doc.body.appendChild(overlay);

  setTimeout(() => {
    onMidpoint();

    overlay.style.transition = `opacity ${fadeOutMs}ms ease`;
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), fadeOutMs + 20);
  }, fadeInMs + holdMs);
}

export function enterRunRuntime(deps = {}) {
  const gs = getRunStartGs(deps);
  if (!gs) return null;

  return runIdempotent('run:enter-run', () => {
    const doc = getRunStartDoc(deps);
    const win = getRunStartWin(deps);
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

      setTimeout(() => {
        const wm = gs.worldMemory || {};
        const hints = [];
        if ((wm.savedMerchant || 0) > 0) hints.push('상인들이 당신을 기억한다');
        if (wm.killed_ancient_echo) hints.push('태고의 잔향이 기다린다');
        if (hints.length && typeof deps.showWorldMemoryNotice === 'function') {
          deps.showWorldMemoryNotice(hints.join(' · '));
        }
      }, 1000);
    };

    const beginGameplayWithStageFade = () => {
      playStageEntryFadeTransition({
        doc,
        win,
        requestAnimationFrame: deps.requestAnimationFrame,
      }, beginGameplay);
      removeRunStartHandoffBlackout(doc);
    };

    let fragmentShown = false;
    if (typeof deps.showRunFragment === 'function') {
      try {
        fragmentShown = !!deps.showRunFragment({
          closeEffect: 'none',
          onFragmentClosed: beginGameplayWithStageFade,
        });
        if (fragmentShown) removeRunStartHandoffBlackout(doc);
      } catch (error) {
        console.error('[RunStartUI] showRunFragment failed:', error);
        fragmentShown = false;
      }
    }

    if (!fragmentShown) {
      const preRunRipplePlayed = !!gs._preRunRipplePlayed;
      gs._preRunRipplePlayed = false;

      if (preRunRipplePlayed) {
        beginGameplayWithStageFade();
      } else {
        removeRunStartHandoffBlackout(doc);
        playRunEntryTransition({
          doc,
          win,
          requestAnimationFrame: deps.requestAnimationFrame,
          cancelAnimationFrame: deps.cancelAnimationFrame,
        }, beginGameplayWithStageFade);
      }
    }
  }, { ttlMs: 2000 });
}
