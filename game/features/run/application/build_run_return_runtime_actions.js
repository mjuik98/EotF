import { returnToGameplayFromRun } from './workflows/run_return_flow.js';
import { OVERLAY_DISMISS_MS } from './run_return_timing.js';

export function buildRunReturnRuntimeActions() {
  return {
    OVERLAY_DISMISS_MS,
    returnToGameplay: returnToGameplayFromRun,
  };
}
