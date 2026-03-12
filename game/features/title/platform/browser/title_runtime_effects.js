import { startEchoRippleDissolve } from '../../../../platform/browser/effects/echo_ripple_transition.js';
import { IntroCinematicUI } from '../../presentation/browser/intro_cinematic_ui.js';

export function createTitleRuntimeEffects(overrides = {}) {
  return {
    playIntroCinematic: (deps, onComplete) => IntroCinematicUI.play(deps, onComplete),
    startPreRunRipple: (overlay, deps) => startEchoRippleDissolve(overlay, deps),
    ...overrides,
  };
}
