import * as Deps from '../../../core/deps_factory.js';

export function createUiPorts(options = {}) {
  const fallbackDoc = typeof document !== 'undefined' ? document : null;
  const doc = options.doc || fallbackDoc;

  return {
    doc,
    getCodexDeps: () => Deps.getCodexDeps(),
    getCombatHudDeps: () => Deps.getCombatHudDeps(),
    getCombatInfoDeps: () => Deps.getCombatInfoDeps(),
    getDeckModalDeps: () => Deps.getDeckModalDeps(),
    getHudUpdateDeps: () => Deps.getHudUpdateDeps(),
    getScreenDeps: () => Deps.getScreenDeps(),
    getTooltipDeps: () => Deps.getTooltipDeps(),
  };
}
