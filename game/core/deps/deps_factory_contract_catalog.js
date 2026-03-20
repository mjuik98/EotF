import { buildDepContractBuilders } from '../deps_contract_registry.js';

export function createDepContractCatalog(runtime, createDeps) {
  let contractBuilders = null;

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

  function listDepContracts() {
    return Object.freeze(Object.keys(getContractBuilders()));
  }

  return {
    getContractBuilders,
    listDepContracts,
  };
}
