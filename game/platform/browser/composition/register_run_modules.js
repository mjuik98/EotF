import { createRunFeatureFacade } from '../../../features/run/public.js';

export function registerRunModules() {
  const capabilities = createRunFeatureFacade().moduleCapabilities;
  return {
    ...capabilities.map,
    ...capabilities.flow,
  };
}
