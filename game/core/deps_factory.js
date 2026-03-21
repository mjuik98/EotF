import { AppError } from './error_reporter.js';
import { ErrorCodes } from './error_codes.js';
import {
  buildContractDepAccessors as buildContractDepAccessorsBase,
  buildFeatureContractAccessors as buildFeatureContractAccessorsBase,
  createDepsAccessors as createDepsAccessorsBase,
} from './deps/deps_factory_accessors.js';
import { createDepContractCatalog } from './deps/deps_factory_contract_catalog.js';
import { syncGlobalDepsFactoryHooks } from './deps/deps_factory_global_bridge.js';
import { createDepsFactoryRuntime } from './deps_factory_runtime.js';

const runtime = createDepsFactoryRuntime();
let contractCatalog = null;

function getContractCatalog() {
  if (!contractCatalog) {
    contractCatalog = createDepContractCatalog(runtime, createDeps);
  }
  return contractCatalog;
}

export function initDepsFactory(refs) {
  runtime.initRefs(refs);
  syncGlobalDepsFactoryHooks({
    getHudUpdateDeps,
  });
}

export function patchRefs(partial) {
  runtime.patchRefs(partial);
  syncGlobalDepsFactoryHooks({
    getHudUpdateDeps,
  });
}

export const DepContracts = new Proxy([], {
  get(_target, prop) {
    const contracts = getContractCatalog().listDepContracts();
    const value = Reflect.get(contracts, prop);
    return typeof value === 'function' ? value.bind(contracts) : value;
  },
});

export function listDepContracts() {
  return [...getContractCatalog().listDepContracts()];
}

export function createDeps(contractName, overrides = {}) {
  const builder = getContractCatalog().getContractBuilders()[contractName];
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
  return createDepsAccessorsBase(contractMap, depsCreator);
}

export function buildContractDepAccessors(contractMap, depsFactory = null) {
  return buildContractDepAccessorsBase(contractMap, depsFactory, {
    createDeps,
    createDepsAccessors,
  });
}

export function buildFeatureContractAccessors(contractMap, depsFactory = null) {
  return buildFeatureContractAccessorsBase(contractMap, depsFactory, {
    buildContractDepAccessors,
    createDeps,
    createDepsAccessors,
  });
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

syncGlobalDepsFactoryHooks({
  getHudUpdateDeps,
});
