import * as Deps from '../../../core/deps_factory.js';
import { IntroCinematicUI } from '../../../ui/title/intro_cinematic_ui.js';
import { startEchoRippleDissolve } from '../../../ui/effects/echo_ripple_transition.js';

export function createTitlePorts(modules, fns, options = {}) {
  const fallbackDoc = typeof document !== 'undefined' ? document : null;
  const fallbackWin = typeof window !== 'undefined' ? window : null;
  const doc = options.doc || fallbackDoc;
  const win = options.win || fallbackWin;

  return {
    doc,
    win,
    fns,
    modules,
    playIntroCinematic: (deps, onComplete) => IntroCinematicUI.play(deps, onComplete),
    startPreRunRipple: (overlay, deps) => startEchoRippleDissolve(overlay, deps),
    getClassSelectDeps: () => Deps.getClassSelectDeps(),
    getRunModeDeps: () => Deps.getRunModeDeps(),
    getMetaProgressionDeps: () => Deps.getMetaProgressionDeps(),
    getRegionTransitionDeps: () => Deps.getRegionTransitionDeps(),
    getHelpPauseDeps: () => Deps.getHelpPauseDeps(),
    getSaveSystemDeps: () => Deps.getSaveSystemDeps(),
    getRunStartDeps: () => Deps.getRunStartDeps(),
    getRunSetupDeps: () => Deps.getRunSetupDeps(),
    getSettingsDeps: () => Deps.getSettingsDeps(),
  };
}
