import { AppError } from './error_reporter.js';
import { ErrorCodes } from './error_codes.js';
import {
  buildContractDepAccessors as buildContractDepAccessorsBase,
  buildFeatureContractAccessors as buildFeatureContractAccessorsBase,
  createDepsAccessors as createDepsAccessorsBase,
} from './deps/deps_factory_accessors.js';
import { createDepsFactoryCaches } from './deps/deps_factory_caches.js';
import { createDepContractCatalog } from './deps/deps_factory_contract_catalog.js';
import { createPublicDepAccessors } from './deps/deps_factory_public_accessors.js';
import { createDepsFactoryPublicRuntime } from './deps/deps_factory_public_runtime.js';
import { createDepsFactoryRuntime } from './deps_factory_runtime.js';

const runtime = createDepsFactoryRuntime();
const depsFactoryCaches = createDepsFactoryCaches({
  createDepContractCatalog,
  createPublicDepAccessors,
  runtime,
  createDeps,
});
const { getContractCatalog, getPublicDepAccessors } = depsFactoryCaches;
const {
  publicDepAccessorExports,
  syncPublicGlobalHooks,
} = createDepsFactoryPublicRuntime({
  createDeps,
  getPublicDepAccessors,
});

export function initDepsFactory(refs) {
  runtime.initRefs(refs);
  syncPublicGlobalHooks();
}

export function patchRefs(partial) {
  runtime.patchRefs(partial);
  syncPublicGlobalHooks();
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

export const {
  baseCardDeps,
  baseDeps,
  getCardTargetDeps,
  getClassSelectDeps,
  getCodexDeps,
  getCombatFlowDeps,
  getCombatHudDeps,
  getCombatInfoDeps,
  getCombatTurnBaseDeps,
  getDeckModalDeps,
  getEventDeps,
  getEventFlowDeps,
  getFeedbackDeps,
  getGameBootDeps,
  getHelpPauseDeps,
  getHudUpdateDeps,
  getMetaProgressionDeps,
  getRegionTransitionDeps,
  getRewardDeps,
  getRewardFlowDeps,
  getRunModeDeps,
  getRunNodeHandoffDeps,
  getRunReturnDeps,
  getRunSetupDeps,
  getRunStartDeps,
  getSaveSystemDeps,
  getScreenDeps,
  getSettingsDeps,
  getStoryDeps,
  getTooltipDeps,
  getWorldCanvasDeps,
} = publicDepAccessorExports;

syncPublicGlobalHooks();
