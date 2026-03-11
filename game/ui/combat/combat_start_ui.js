/**
 * combat_start_ui.js ???꾪닾 ?쒖옉 UI (?쒖닔 View)
 *
 * CombatInitializer?먯꽌 濡쒖쭅??泥섎━?섍퀬, ???뚯씪? DOM ?낅뜲?댄듃留??대떦?⑸땲??
 */
import { startCombatFlowUseCase } from '../../app/combat/use_cases/start_combat_flow_use_case.js';
import { CombatInitializer } from '../../combat/combat_initializer.js';
import { playEventBossPhase } from '../../domain/audio/audio_event_helpers.js';
import {
  applyCombatEntryOverlay,
  finalizeCombatStartUi,
  resetCombatStartSurface,
  scheduleCombatEntryAnimations,
  scheduleCombatStartBanner,
  showCombatBossBanner,
  syncCombatStartButtons,
} from './combat_start_runtime_ui.js';

export const CombatStartUI = {
  startCombat(mode = 'normal', deps = {}) {
    const gs = deps.gs;
    const startResult = startCombatFlowUseCase(mode, {
      ...deps,
      applyRegionDebuffs: CombatInitializer.applyRegionDebuffs.bind(CombatInitializer),
      initDeck: CombatInitializer.initDeck.bind(CombatInitializer),
      playBossPhase: playEventBossPhase,
      resetCombatState: CombatInitializer.resetCombatState.bind(CombatInitializer),
      spawnEnemies: CombatInitializer.spawnEnemies.bind(CombatInitializer),
    });
    if (!startResult) return;
    const { isBoss, isMiniBoss } = startResult;

    // UI updates
    resetCombatStartSurface(gs, deps);
    applyCombatEntryOverlay(gs, deps);

    if (isBoss || isMiniBoss) {
      showCombatBossBanner(gs, isMiniBoss, deps);
    }

    scheduleCombatEntryAnimations(deps);
    syncCombatStartButtons(gs, deps);
    scheduleCombatStartBanner(isBoss, isMiniBoss, deps);
    finalizeCombatStartUi(gs, deps);
  },
};
