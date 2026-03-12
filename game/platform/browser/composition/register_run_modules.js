import { createRunFeatureFacade } from '../../../features/run/public.js';

export function registerRunModules() {
  const groups = createRunFeatureFacade().modules;

  return {
    ...groups.map,
    ...groups.flow,
  };
}
