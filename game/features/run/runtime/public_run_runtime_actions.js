import { buildRunBootActions } from '../app/build_run_boot_actions.js';
import { returnToGameplayFromRun } from '../application/run_return_actions.js';
import { OVERLAY_DISMISS_MS } from '../presentation/browser/run_return_overlay_presenter.js';

export function buildRunBootPublicActions(fns) {
  return buildRunBootActions(fns);
}

export function buildRunReturnRuntimePublicActions() {
  return {
    OVERLAY_DISMISS_MS,
    returnToGameplay: returnToGameplayFromRun,
  };
}
