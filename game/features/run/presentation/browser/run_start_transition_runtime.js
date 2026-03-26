import { startEchoRippleDissolve } from '../../../../platform/browser/effects/echo_ripple_transition.js';

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
