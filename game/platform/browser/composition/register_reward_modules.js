import { createLazyRewardModule } from '../../../features/reward/platform/browser/create_lazy_reward_module.js';

export function registerRewardModules() {
  return {
    RewardUI: createLazyRewardModule(),
  };
}
