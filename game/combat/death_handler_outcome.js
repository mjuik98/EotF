import { showDefeatOutcome } from './death_handler_runtime.js';

export function showDeathOutcomeScreen(gs, deps = {}, win = null) {
  const finalizeRunOutcome = deps.finalizeRunOutcome || win?.finalizeRunOutcome;
  const endingScreenUI = deps.endingScreenUI || deps.EndingScreenUI;
  const selectFragment = deps.selectFragment || win?.selectFragment;

  showDefeatOutcome({
    deps,
    endingScreenUI,
    finalizeRunOutcome,
    gs,
    selectFragment,
  });
}
