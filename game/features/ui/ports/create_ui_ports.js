import * as Deps from '../../../core/deps_factory.js';

const UI_DEP_CONTRACTS = Object.freeze({
  getCodexDeps: 'codex',
  getCombatHudDeps: 'combatHud',
  getCombatInfoDeps: 'combatInfo',
  getDeckModalDeps: 'deckModal',
  getHelpPauseDeps: 'helpPause',
  getHudUpdateDeps: 'hudUpdate',
  getScreenDeps: 'screen',
  getTooltipDeps: 'tooltip',
});

function buildUiDepAccessors() {
  return Deps.buildFeatureContractAccessors(UI_DEP_CONTRACTS, Deps);
}

function resolveUiDocument(options = {}) {
  if (options.doc) return options.doc;
  if (options.win?.document) return options.win.document;
  return typeof document !== 'undefined' ? document : null;
}

export function createUiPorts(options = {}) {
  const doc = resolveUiDocument(options);
  const depAccessors = buildUiDepAccessors();

  return {
    doc,
    ...depAccessors,
  };
}
