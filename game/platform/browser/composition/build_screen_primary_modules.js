import { createUiModuleCapabilities } from '../../../features/ui/public.js';
import { createCodexModuleCapabilities } from '../../../features/codex/public.js';
import { createEventModuleCapabilities } from '../../../features/event/public.js';
import { createRewardModuleCapabilities } from '../../../features/reward/public.js';

export function buildScreenPrimaryModules() {
  const uiCapabilities = createUiModuleCapabilities();
  const codexCapabilities = createCodexModuleCapabilities();
  const eventCapabilities = createEventModuleCapabilities();
  const rewardCapabilities = createRewardModuleCapabilities();
  return {
    ...uiCapabilities.primary,
    ...codexCapabilities.primary,
    ...eventCapabilities.primary,
    ...rewardCapabilities.primary,
  };
}
