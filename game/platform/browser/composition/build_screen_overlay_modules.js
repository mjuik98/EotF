import { createUiModuleCapabilities } from '../../../features/ui/ports/public_module_capabilities.js';

export function buildScreenOverlayModules() {
  return createUiModuleCapabilities().overlays;
}
