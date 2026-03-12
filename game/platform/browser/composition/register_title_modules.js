import { createTitleFeatureFacade } from '../../../features/title/public.js';

export function registerTitleModules() {
  const capabilities = createTitleFeatureFacade().moduleCapabilities;
  return {
    ...capabilities.canvas,
    ...capabilities.flow,
  };
}
