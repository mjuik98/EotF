import { startCombatFlowUseCase } from './start_combat_flow_use_case.js';
import {
  enterCombatState,
  setActiveCombatRegionState,
} from '../state/combat_entry_state_commands.js';
import { createCombatStartRuntimePorts } from '../platform/combat_start_runtime_ports.js';

function buildCombatStartDeps(deps = {}, runtime = {}) {
  const defaultPorts = createCombatStartRuntimePorts();
  return {
    ...deps,
    applyRegionDebuffs: runtime.applyRegionDebuffs || defaultPorts.applyRegionDebuffs,
    enterCombatState: runtime.enterCombatState || enterCombatState,
    initDeck: runtime.initDeck || defaultPorts.initDeck,
    playBossPhase: runtime.playBossPhase || defaultPorts.playBossPhase,
    resetCombatState: runtime.resetCombatState || defaultPorts.resetCombatState,
    setActiveCombatRegionState: runtime.setActiveCombatRegionState || setActiveCombatRegionState,
    spawnEnemies: runtime.spawnEnemies || defaultPorts.spawnEnemies,
  };
}

export function startCombatRuntime(mode = 'normal', deps = {}, runtime = {}) {
  const gs = deps.gs;
  const runtimeDeps = buildCombatStartDeps(deps, runtime);
  const defaultPorts = createCombatStartRuntimePorts();
  const startResult = startCombatFlowUseCase(mode, runtimeDeps);
  if (!startResult) return null;

  const { isBoss, isMiniBoss } = startResult;
  const resetSurface = runtime.resetCombatStartSurface || defaultPorts.resetCombatStartSurface;
  const applyOverlay = runtime.applyCombatEntryOverlay || defaultPorts.applyCombatEntryOverlay;
  const showBossBanner = runtime.showCombatBossBanner || defaultPorts.showCombatBossBanner;
  const scheduleAnimations = runtime.scheduleCombatEntryAnimations || defaultPorts.scheduleCombatEntryAnimations;
  const syncButtons = runtime.syncCombatStartButtons || defaultPorts.syncCombatStartButtons;
  const scheduleBanner = runtime.scheduleCombatStartBanner || defaultPorts.scheduleCombatStartBanner;
  const finalizeUi = runtime.finalizeCombatStartUi || defaultPorts.finalizeCombatStartUi;

  resetSurface(gs, runtimeDeps);
  applyOverlay(gs, runtimeDeps);

  if (isBoss || isMiniBoss) {
    showBossBanner(gs, isMiniBoss, runtimeDeps);
  }

  scheduleAnimations(runtimeDeps);
  syncButtons(gs, runtimeDeps);
  scheduleBanner(isBoss, isMiniBoss, runtimeDeps);
  finalizeUi(gs, runtimeDeps);

  return startResult;
}

export function createCombatStartRuntime(runtime = {}) {
  return {
    startCombat(mode = 'normal', deps = {}) {
      return startCombatRuntime(mode, deps, runtime);
    },
  };
}
