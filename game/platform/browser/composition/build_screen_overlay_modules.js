import { createUiFeatureFacade } from '../../../features/ui/public.js';

export function buildScreenOverlayModules() {
  return createUiFeatureFacade().moduleCapabilities.overlays;
}
