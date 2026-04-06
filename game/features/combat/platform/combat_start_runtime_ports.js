import { CombatInitializer } from '../application/combat_initializer.js';
import { playEventBossPhase } from '../integration/ui_support_capabilities.js';
import {
  applyCombatEntryOverlay,
  finalizeCombatStartUi,
  resetCombatStartSurface,
  scheduleCombatEntryAnimations,
  scheduleCombatStartBanner,
  showCombatBossBanner,
  syncCombatStartButtons,
} from '../presentation/browser/combat_start_runtime_ui.js';

export function createCombatStartRuntimePorts() {
  return {
    applyCombatEntryOverlay,
    applyRegionDebuffs: CombatInitializer.applyRegionDebuffs.bind(CombatInitializer),
    finalizeCombatStartUi,
    initDeck: CombatInitializer.initDeck.bind(CombatInitializer),
    playBossPhase: playEventBossPhase,
    resetCombatStartSurface,
    resetCombatState: CombatInitializer.resetCombatState.bind(CombatInitializer),
    scheduleCombatEntryAnimations,
    scheduleCombatStartBanner,
    showCombatBossBanner,
    spawnEnemies: CombatInitializer.spawnEnemies.bind(CombatInitializer),
    syncCombatStartButtons,
  };
}
