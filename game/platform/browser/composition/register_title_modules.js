import { createTitleFeatureFacade } from '../../../features/title/public.js';

export function registerTitleModules() {
  const groups = createTitleFeatureFacade().modules;

  return {
    ...groups.canvas,
    ...groups.flow,
  };
}
