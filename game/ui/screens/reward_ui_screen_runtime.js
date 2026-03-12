import { showRewardScreenRuntime as showRewardScreenFeatureRuntime } from '../../features/reward/public.js';

export function showRewardScreenRuntime(ui, mode = false, deps = {}) {
  return showRewardScreenFeatureRuntime(ui, mode, deps);
}
