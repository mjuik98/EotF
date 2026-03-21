import { createLazyCodexModule } from '../../../features/codex/platform/browser/create_lazy_codex_module.js';
import { createLazyEventModule } from '../../../features/event/platform/browser/create_lazy_event_module.js';
import { createLazyRewardModule } from '../../../features/reward/platform/browser/create_lazy_reward_module.js';

export function buildScreenFeaturePrimaryModules() {
  return {
    CodexUI: createLazyCodexModule(),
    EventUI: createLazyEventModule(),
    RewardUI: createLazyRewardModule(),
  };
}
