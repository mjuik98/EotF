import { AppError } from './error_reporter.js';
import { ErrorCodes } from './error_codes.js';
import { createDepsFactoryRuntime } from './deps_factory_runtime.js';
import { buildDepContractBuilders } from './deps_contract_registry.js';

const runtime = createDepsFactoryRuntime();
let contractBuilders = null;

function getHostObject() {
  try {
    return Function('return this')();
  } catch {
    return globalThis;
  }
}

function syncGlobalDepsFactoryHooks() {
  const host = getHostObject();
  if (!host) return;
  host.__ECHO_DEPS_FACTORY__ = {
    getHudUpdateDeps,
  };
}

function getContractBuilders() {
  if (!contractBuilders) {
    contractBuilders = buildDepContractBuilders({
      getRefs: runtime.getRefs,
      buildBaseDeps: runtime.buildBaseDeps,
      getGameDeps: runtime.getGameDeps,
      getRunDeps: runtime.getRunDeps,
      getCombatDeps: runtime.getCombatDeps,
      getEventDeps: runtime.getEventDeps,
      getHudDeps: runtime.getHudDeps,
      getUiDeps: runtime.getUiDeps,
      getCanvasDeps: runtime.getCanvasDeps,
      getRaf: runtime.getRaf,
      getSyncVolumeUIFallback: runtime.getSyncVolumeUIFallback,
      createDeps,
    });
  }
  return contractBuilders;
}

export function initDepsFactory(refs) {
  runtime.initRefs(refs);
  syncGlobalDepsFactoryHooks();
}

export function patchRefs(partial) {
  runtime.patchRefs(partial);
  syncGlobalDepsFactoryHooks();
}

export const DepContracts = Object.freeze(Object.keys(getContractBuilders()));

export function listDepContracts() {
  return [...DepContracts];
}

export function createDeps(contractName, overrides = {}) {
  const builder = getContractBuilders()[contractName];
  if (!builder) {
    throw new AppError(
      ErrorCodes.DEPS_CONTRACT_MISSING,
      `[deps_factory] Unknown dependency contract: ${contractName}`,
      { context: 'deps_factory.createDeps', meta: { contractName } },
    );
  }

  return {
    ...builder(),
    ...overrides,
  };
}

export function createDepsAccessors(contractMap, depsCreator = createDeps) {
  const accessors = {};

  for (const [accessorName, contractName] of Object.entries(contractMap || {})) {
    accessors[accessorName] = (overrides = {}) => depsCreator(contractName, overrides);
  }

  return Object.freeze(accessors);
}

export function buildContractDepAccessors(contractMap, depsFactory = null) {
  const injectedAccessorFactory =
    typeof depsFactory?.createDepsAccessors === 'function'
      ? depsFactory.createDepsAccessors
      : null;
  const injectedDepsCreator =
    typeof depsFactory === 'function'
      ? depsFactory
      : typeof depsFactory?.createDeps === 'function'
        ? depsFactory.createDeps
        : null;

  if (!depsFactory || injectedAccessorFactory || injectedDepsCreator) {
    const depsAccessorFactory = injectedAccessorFactory || createDepsAccessors;
    const depsCreator = injectedDepsCreator || createDeps;
    if (typeof depsAccessorFactory === 'function' && typeof depsCreator === 'function') {
      return depsAccessorFactory(contractMap, depsCreator);
    }
  }

  const accessors = {};
  for (const accessorName of Object.keys(contractMap || {})) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(depsFactory?.[accessorName]?.() || {}),
      ...overrides,
    });
  }

  return Object.freeze(accessors);
}

export function buildFeatureContractAccessors(contractMap, depsFactory = null) {
  const resolvedFactory = depsFactory || {};
  const buildAccessors =
    typeof resolvedFactory.buildContractDepAccessors === 'function'
      ? resolvedFactory.buildContractDepAccessors
      : buildContractDepAccessors;
  if (typeof buildAccessors === 'function') {
    return buildAccessors(contractMap, resolvedFactory);
  }

  const createDepsFn =
    typeof resolvedFactory === 'function'
      ? resolvedFactory
      : typeof resolvedFactory.createDeps === 'function'
        ? resolvedFactory.createDeps
        : createDeps;
  const createAccessors =
    typeof resolvedFactory.createDepsAccessors === 'function'
      ? resolvedFactory.createDepsAccessors
      : createDepsAccessors;
  if (typeof createAccessors === 'function' && typeof createDepsFn === 'function') {
    return createAccessors(contractMap, createDepsFn);
  }

  const accessors = {};
  for (const accessorName of Object.keys(contractMap || {})) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(resolvedFactory?.[accessorName]?.() || {}),
      ...overrides,
    });
  }
  return Object.freeze(accessors);
}

export function baseDeps() { return createDeps('base'); }
export function getStoryDeps() { return createDeps('story'); }
export function getCombatTurnBaseDeps() { return createDeps('combatTurnBase'); }
export function getEventDeps() { return createDeps('event'); }
export function getRewardDeps() { return createDeps('reward'); }
export function getRunReturnDeps() { return createDeps('runReturn'); }
export function getCombatFlowDeps() { return createDeps('combatFlow'); }
export function getEventFlowDeps() { return createDeps('eventFlow'); }
export function getRewardFlowDeps() { return createDeps('rewardFlow'); }
export function getHudUpdateDeps() { return createDeps('hudUpdate'); }
export function getCombatHudDeps() { return createDeps('combatHud'); }
export function getCardTargetDeps() { return createDeps('cardTarget'); }
export function baseCardDeps() { return createDeps('baseCard'); }
export function getFeedbackDeps() { return createDeps('feedback'); }
export function getCodexDeps() { return createDeps('codex'); }
export function getDeckModalDeps() { return createDeps('deckModal'); }
export function getTooltipDeps() { return createDeps('tooltip'); }
export function getScreenDeps() { return createDeps('screen'); }
export function getCombatInfoDeps() { return createDeps('combatInfo'); }
export function getClassSelectDeps() { return createDeps('classSelect'); }
export function getSaveSystemDeps() { return createDeps('saveSystem'); }
export function getRunModeDeps() { return createDeps('runMode'); }
export function getRunStartDeps() { return createDeps('runStart'); }
export function getRunSetupDeps() { return createDeps('runSetup'); }
export function getRunNodeHandoffDeps() { return createDeps('runNodeHandoff'); }
export function getMetaProgressionDeps() { return createDeps('metaProgression'); }
export function getRegionTransitionDeps() { return createDeps('regionTransition'); }
export function getHelpPauseDeps() { return createDeps('helpPause'); }
export function getWorldCanvasDeps() { return createDeps('worldCanvas'); }
export function getSettingsDeps() { return createDeps('settings'); }
export function getGameBootDeps() { return createDeps('gameBoot'); }

syncGlobalDepsFactoryHooks();
