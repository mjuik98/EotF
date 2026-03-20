import { buildScreenFeaturePrimaryModules } from './build_screen_feature_primary_modules.js';

export function registerRewardModules() {
  const { RewardUI } = buildScreenFeaturePrimaryModules();
  return RewardUI ? { RewardUI } : {};
}
