import { CombatInitializer } from '../../../combat/combat_initializer.js';
import { playEventBossPhase } from '../../../domain/audio/audio_event_helpers.js';
import {
  applyCombatEntryOverlay,
  finalizeCombatStartUi,
  resetCombatStartSurface,
  scheduleCombatEntryAnimations,
  scheduleCombatStartBanner,
  showCombatBossBanner,
  syncCombatStartButtons,
} from '../../../ui/combat/combat_start_runtime_ui.js';

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
