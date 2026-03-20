import { createUiModuleCapabilities } from '../../../features/ui/ports/public_module_capabilities.js';

export function buildScreenShellPrimaryModules() {
  return createUiModuleCapabilities().primary;
}
