import { runIdempotent } from './run_idempotency.js';
import { createRunGameplayRuntime } from './run_start_gameplay_runtime.js';
import {
  getRunStartDoc,
  getRunStartGs,
  getRunStartWin,
  playRunEntryTransition,
  removeRunStartHandoffBlackout,
  RUN_START_HANDOFF_BLACKOUT_ID,
} from './run_start_transition_runtime.js';

export {
  getRunStartDoc,
  getRunStartGs,
  getRunStartWin,
  playRunEntryTransition,
  playStageEntryFadeTransition,
  removeRunStartHandoffBlackout,
  RUN_START_HANDOFF_BLACKOUT_ID,
} from './run_start_transition_runtime.js';

export function enterRunRuntime(deps = {}) {
  const gs = getRunStartGs(deps);
  if (!gs) return null;

  return runIdempotent('run:enter-run', () => {
    const doc = getRunStartDoc(deps);
    const win = getRunStartWin(deps);
    const {
      beginGameplayWithStageFade,
    } = createRunGameplayRuntime({ deps, doc, gs, win });

    let fragmentShown = false;
    if (typeof deps.showRunFragment === 'function') {
      try {
        fragmentShown = !!deps.showRunFragment({
          closeEffect: 'none',
          onFragmentClosed: beginGameplayWithStageFade,
        });
        if (fragmentShown) removeRunStartHandoffBlackout(doc);
      } catch (error) {
        console.error('[RunStartUI] showRunFragment failed:', error);
        fragmentShown = false;
      }
    }

    if (!fragmentShown) {
      const preRunRipplePlayed = !!gs._preRunRipplePlayed;
      gs._preRunRipplePlayed = false;

      if (preRunRipplePlayed) {
        beginGameplayWithStageFade();
      } else {
        removeRunStartHandoffBlackout(doc);
        playRunEntryTransition({
          doc,
          win,
          requestAnimationFrame: deps.requestAnimationFrame,
          cancelAnimationFrame: deps.cancelAnimationFrame,
        }, beginGameplayWithStageFade);
      }
    }
  }, { ttlMs: 2000 });
}
