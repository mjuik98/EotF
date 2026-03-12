import { IntroCinematicUI } from '../../../../ui/title/intro_cinematic_ui.js';
import { startEchoRippleDissolve } from '../../../../ui/effects/echo_ripple_transition.js';

export function createTitleRuntimeEffects(overrides = {}) {
  return {
    playIntroCinematic: (deps, onComplete) => IntroCinematicUI.play(deps, onComplete),
    startPreRunRipple: (overlay, deps) => startEchoRippleDissolve(overlay, deps),
    ...overrides,
  };
}
