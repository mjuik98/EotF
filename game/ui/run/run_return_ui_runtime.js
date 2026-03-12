import { returnToGameplayFromRun } from '../../features/run/application/run_return_actions.js';
export { OVERLAY_DISMISS_MS } from '../../features/run/presentation/browser/run_return_overlay_presenter.js';

export function returnToGameRuntime(fromReward, deps = {}) {
  return returnToGameplayFromRun(fromReward, deps);
}
