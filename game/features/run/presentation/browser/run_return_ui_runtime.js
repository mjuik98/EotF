import { returnToGameplayFromRun } from '../../application/workflows/run_return_flow.js';
export { OVERLAY_DISMISS_MS } from './run_return_overlay_presenter.js';

export function returnToGameRuntime(fromReward, deps = {}) {
  return returnToGameplayFromRun(fromReward, deps);
}
