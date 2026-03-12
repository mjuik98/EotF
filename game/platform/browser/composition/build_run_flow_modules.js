import { createRunFeatureFacade } from '../../../features/run/public.js';

export function buildRunFlowModules() {
  return createRunFeatureFacade().moduleCapabilities.flow;
}
