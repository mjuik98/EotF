import { createUiModuleCapabilities } from '../../../features/ui/ports/public_module_capabilities.js';
import { createCodexModuleCapabilities } from '../../../features/codex/ports/public_module_capabilities.js';
import { createEventModuleCapabilities } from '../../../features/event/ports/public_module_capabilities.js';
import { createRewardModuleCapabilities } from '../../../features/reward/ports/public_module_capabilities.js';

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
