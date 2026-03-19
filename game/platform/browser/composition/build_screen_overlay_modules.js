import { createUiModuleCapabilities } from '../../../features/ui/public.js';

export function buildScreenOverlayModules() {
  return createUiModuleCapabilities().overlays;
}
