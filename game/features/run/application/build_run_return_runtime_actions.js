import { returnToGameplayFromRun } from './run_return_actions.js';
import { OVERLAY_DISMISS_MS } from '../presentation/browser/run_return_overlay_presenter.js';

export function buildRunReturnRuntimeActions() {
  return {
    OVERLAY_DISMISS_MS,
    returnToGameplay: returnToGameplayFromRun,
  };
}
