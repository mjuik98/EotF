import { AppError } from './error_reporter.js';
import { ErrorCodes } from './error_codes.js';
import { createDepsFactoryRuntime } from './deps_factory_runtime.js';
import { buildDepContractBuilders } from './deps_contract_registry.js';

const runtime = createDepsFactoryRuntime();
let contractBuilders = null;

function getContractBuilders() {
  if (!contractBuilders) {
    contractBuilders = buildDepContractBuilders({
      getRefs: runtime.getRefs,
      buildBaseDeps: runtime.buildBaseDeps,
      getGameDeps: runtime.getGameDeps,
      getRaf: runtime.getRaf,
      getSyncVolumeUIFallback: runtime.getSyncVolumeUIFallback,
      createDeps,
    });
  }
  return contractBuilders;
}

export function initDepsFactory(refs) {
  runtime.initRefs(refs);
}

export function patchRefs(partial) {
  runtime.patchRefs(partial);
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

export function baseDeps() { return createDeps('base'); }
export function getStoryDeps() { return createDeps('story'); }
export function getCombatTurnBaseDeps() { return createDeps('combatTurnBase'); }
export function getEventDeps() { return createDeps('event'); }
export function getRewardDeps() { return createDeps('reward'); }
export function getRunReturnDeps() { return createDeps('runReturn'); }
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
export function getMetaProgressionDeps() { return createDeps('metaProgression'); }
export function getRegionTransitionDeps() { return createDeps('regionTransition'); }
export function getHelpPauseDeps() { return createDeps('helpPause'); }
export function getWorldCanvasDeps() { return createDeps('worldCanvas'); }
export function getSettingsDeps() { return createDeps('settings'); }
export function getGameBootDeps() { return createDeps('gameBoot'); }
