import { createCodexModuleCapabilities } from '../../../features/codex/ports/public_module_capabilities.js';
import { createEventModuleCapabilities } from '../../../features/event/ports/public_module_capabilities.js';
import { createRewardModuleCapabilities } from '../../../features/reward/ports/public_module_capabilities.js';

export function buildScreenFeaturePrimaryModules() {
  return {
    ...createCodexModuleCapabilities().primary,
    ...createEventModuleCapabilities().primary,
    ...createRewardModuleCapabilities().primary,
  };
}
