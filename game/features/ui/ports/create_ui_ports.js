import * as Deps from '../../../core/deps_factory.js';

const UI_DEP_CONTRACTS = Object.freeze({
  getCodexDeps: 'codex',
  getCombatHudDeps: 'combatHud',
  getCombatInfoDeps: 'combatInfo',
  getDeckModalDeps: 'deckModal',
  getHudUpdateDeps: 'hudUpdate',
  getScreenDeps: 'screen',
  getTooltipDeps: 'tooltip',
});

function buildUiDepAccessors() {
  return Deps.buildFeatureContractAccessors(UI_DEP_CONTRACTS, Deps);
}

export function createUiPorts(options = {}) {
  const fallbackDoc = typeof document !== 'undefined' ? document : null;
  const doc = options.doc || fallbackDoc;
  const depAccessors = buildUiDepAccessors();

  return {
    doc,
    ...depAccessors,
  };
}
