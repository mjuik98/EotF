import { returnToGameplayFromRun } from '../../application/run_return_actions.js';
export { OVERLAY_DISMISS_MS } from './run_return_overlay_presenter.js';

export function returnToGameRuntime(fromReward, deps = {}) {
  return returnToGameplayFromRun(fromReward, deps);
}
