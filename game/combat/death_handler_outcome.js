import {
  buildDeathEndingActions,
  showDefeatOutcome,
} from './death_handler_runtime.js';

export function buildDeathOutcomePayload(gs, deps = {}, win = null) {
  const finalizeRunOutcome = deps.finalizeRunOutcome || win?.finalizeRunOutcome;
  const endingScreenUI = deps.endingScreenUI || deps.EndingScreenUI;
  const selectFragment = deps.selectFragment || win?.selectFragment;

  return {
    deps,
    endingScreenUI,
    finalizeRunOutcome,
    gs,
    selectFragment,
    win,
    endingActions: buildDeathEndingActions({ ...deps, selectFragment }, win),
  };
}

export function showDeathOutcomeScreen(gs, deps = {}, win = null) {
  const payload = buildDeathOutcomePayload(gs, deps, win);
  showDefeatOutcome(payload);
}
