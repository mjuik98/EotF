import { runIdempotent } from '../../utils/idempotency_utils.js';
import {
  applyStartBonuses,
  applyRunStartLoadout,
  resetRunConfig,
  resetRuntimeState,
  resolveRunSetupContext,
} from './run_setup_helpers.js';

export const RunSetupUI = {
  startGame(deps = {}) {
    const context = resolveRunSetupContext(deps);
    if (!context) return;

    const {
      audioEngine,
      classMeta,
      data,
      gs,
      maxHp,
      runRules,
      selectedClass,
    } = context;

    return runIdempotent('run:start-game', () => {
      audioEngine.init?.();
      audioEngine.resume?.();
      runRules.ensureMeta?.(gs.meta);

      resetRunConfig(gs);
      applyRunStartLoadout(gs, selectedClass, {
        ...classMeta,
        stats: { ...classMeta.stats, HP: maxHp },
      }, data);
      applyStartBonuses(gs, data);
      runRules.applyRunStart?.(gs);

      if (typeof deps.shuffleArray === 'function') deps.shuffleArray(gs.player.deck);

      resetRuntimeState(gs, gs.meta.worldMemory);

      if (typeof deps.resetDeckModalFilter === 'function') deps.resetDeckModalFilter();
      if (typeof deps.enterRun === 'function') deps.enterRun();
      if (typeof deps.updateUI === 'function') deps.updateUI();
      gs.markDirty('hud');
    }, { ttlMs: 2500 });
  },
};
