import { runIdempotent } from '../../utils/idempotency_utils.js';
import { startEchoRippleDissolve } from '../effects/echo_ripple_transition.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

function _getWin(deps) {
  return deps?.win || window;
}

function _playRunEntryTransition(deps = {}, onComplete = () => {}) {
  const doc = _getDoc(deps);
  const win = _getWin(deps);

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

function _playStageEntryFadeTransition(deps = {}, onMidpoint = () => {}) {
  const doc = _getDoc(deps);
  const win = _getWin(deps);

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
    'opacity:0',
    'z-index:2102',
    'pointer-events:none',
  ].join(';');
  doc.body.appendChild(overlay);

  const raf = deps.requestAnimationFrame || win?.requestAnimationFrame;
  if (typeof raf === 'function') {
    raf(() => {
      overlay.style.transition = `opacity ${fadeInMs}ms ease`;
      overlay.style.opacity = '1';
    });
  } else {
    overlay.style.transition = `opacity ${fadeInMs}ms ease`;
    overlay.style.opacity = '1';
  }

  setTimeout(() => {
    onMidpoint();

    overlay.style.transition = `opacity ${fadeOutMs}ms ease`;
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), fadeOutMs + 20);
  }, fadeInMs + holdMs);
}

export const RunStartUI = {
  enterRun(deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;

    return runIdempotent('run:enter-run', () => {
      const doc = _getDoc(deps);
      const win = _getWin(deps);
      let gameplayStarted = false;

      const beginGameplay = () => {
        if (gameplayStarted) return;
        gameplayStarted = true;

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
          const raf = deps.requestAnimationFrame || win?.requestAnimationFrame;
          if (typeof raf === 'function' && typeof deps.gameLoop === 'function') {
            raf(deps.gameLoop);
          }
        }, 80);

        setTimeout(() => {
          const wm = gs.worldMemory || {};
          const hints = [];
          if ((wm.savedMerchant || 0) > 0) hints.push('\uC0C1\uC778\uB4E4\uC774 \uB2F9\uC2E0\uC744 \uAE30\uC5B5\uD55C\uB2E4');
          if (wm.killed_ancient_echo) hints.push('\uD0DC\uACE0\uC758 \uC794\uD5A5\uC774 \uAE30\uB2E4\uB9B0\uB2E4');
          if (hints.length && typeof deps.showWorldMemoryNotice === 'function') {
            deps.showWorldMemoryNotice(hints.join(' \u00B7 '));
          }
        }, 1000);
      };

      const beginGameplayWithStageFade = () => {
        _playStageEntryFadeTransition({
          doc,
          win,
          requestAnimationFrame: deps.requestAnimationFrame,
        }, beginGameplay);
      };

      let fragmentShown = false;
      if (typeof deps.showRunFragment === 'function') {
        try {
          fragmentShown = !!deps.showRunFragment({
            closeEffect: 'none',
            onFragmentClosed: beginGameplayWithStageFade,
          });
        } catch (err) {
          console.error('[RunStartUI] showRunFragment failed:', err);
          fragmentShown = false;
        }
      }

      if (!fragmentShown) {
        const preRunRipplePlayed = !!gs._preRunRipplePlayed;
        gs._preRunRipplePlayed = false;

        if (preRunRipplePlayed) {
          beginGameplayWithStageFade();
        } else {
          _playRunEntryTransition({
            doc,
            win,
            requestAnimationFrame: deps.requestAnimationFrame,
            cancelAnimationFrame: deps.cancelAnimationFrame,
          }, beginGameplayWithStageFade);
        }
      }
    }, { ttlMs: 2000 });
  },
};
