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

function getOptionalFactoryExport(exportName) {
  return Object.prototype.hasOwnProperty.call(Deps, exportName)
    ? Deps[exportName]
    : null;
}

function buildUiDepAccessors() {
  const createDepsAccessors = getOptionalFactoryExport('createDepsAccessors');
  const createDeps = getOptionalFactoryExport('createDeps');

  if (typeof createDepsAccessors === 'function' && typeof createDeps === 'function') {
    return createDepsAccessors(UI_DEP_CONTRACTS, createDeps);
  }

  const accessors = {};

  for (const accessorName of Object.keys(UI_DEP_CONTRACTS)) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(Deps[accessorName]?.() || {}),
      ...overrides,
    });
  }

  return Object.freeze(accessors);
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
