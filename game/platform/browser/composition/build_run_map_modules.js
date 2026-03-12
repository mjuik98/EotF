import { createRunFeatureFacade } from '../../../features/run/public.js';

export function buildRunMapModules() {
  return createRunFeatureFacade().modules.map;
}
