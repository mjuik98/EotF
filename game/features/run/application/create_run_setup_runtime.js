import { runIdempotent } from '../../../utils/idempotency_utils.js';
import { createStartRunUseCase } from './start_run_use_case.js';
import {
  applyStartBonuses,
  resolveRunSetupContext,
} from './run_setup_helpers.js';

export function startGameRuntime(deps = {}) {
  const context = resolveRunSetupContext(deps);
  if (!context) return null;

  const {
    audioEngine,
    classMeta,
    data,
    gs,
    runRules,
    selectedClass,
  } = context;
  const startRun = createStartRunUseCase();

  return runIdempotent('run:start-game', () => {
    return startRun({
      audioEngine,
      applyStartBonuses,
      classMeta: {
        ...classMeta,
        stats: { ...classMeta.stats, HP: context.maxHp },
      },
      data,
      enterGameplay: deps.enterGameplay,
      enterRun: deps.enterRun,
      gs,
      resetDeckModalFilter: deps.resetDeckModalFilter,
      runRules,
      selectedClass,
      shuffleArray: deps.shuffleArray,
      updateUI: deps.updateUI,
    });
  }, { ttlMs: 2500 });
}
