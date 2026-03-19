import { returnToGameplayFromRun } from './workflows/run_return_flow.js';
import { OVERLAY_DISMISS_MS } from '../presentation/browser/run_return_overlay_presenter.js';

export function buildRunReturnRuntimeActions() {
  return {
    OVERLAY_DISMISS_MS,
    returnToGameplay: returnToGameplayFromRun,
  };
}
