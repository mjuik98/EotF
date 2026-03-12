import { createRunFeatureFacade } from '../../../features/run/public.js';

export function buildRunFlowModules() {
  return createRunFeatureFacade().modules.flow;
}
